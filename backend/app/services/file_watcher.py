"""
File Watcher Service

Monitors the Obsidian vault directory for changes and triggers incremental cache updates.
Uses watchdog library for efficient file system monitoring with debouncing.
"""

import time
from pathlib import Path
from threading import Event, Lock, Thread
from typing import Callable, Optional, Set

import structlog
from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer

from app.services.cache_service import cache_service

logger = structlog.get_logger(__name__)


class VaultFileHandler(FileSystemEventHandler):
    """
    Handles file system events for Obsidian vault.
    Debounces rapid changes and triggers cache invalidation.
    """

    def __init__(self, debounce_seconds: float = 2.0):
        """
        Initialize file handler with debouncing

        Args:
            debounce_seconds: Wait time before processing changes (default: 2 seconds)
        """
        super().__init__()
        self.debounce_seconds = debounce_seconds
        self.pending_changes: Set[str] = set()
        self.last_event_time: float = 0.0
        self.lock = Lock()
        self.invalidation_callbacks: list[Callable] = []

    def add_invalidation_callback(self, callback: Callable) -> None:
        """Register a callback to be called when cache should be invalidated"""
        self.invalidation_callbacks.append(callback)

    def on_any_event(self, event: FileSystemEvent) -> None:
        """Handle any file system event"""
        # Only care about .md files
        if not event.src_path.endswith(".md"):
            return

        # Skip temporary files and hidden files
        path = Path(event.src_path)
        if path.name.startswith(".") or path.name.startswith("~"):
            return

        # Skip excluded directories
        excluded_dirs = {".obsidian", "templates", "Archive", ".trash", "Excalidraw"}
        if any(excluded in event.src_path for excluded in excluded_dirs):
            return

        with self.lock:
            self.pending_changes.add(event.src_path)
            self.last_event_time = time.time()

        logger.debug(f"File change detected: {event.event_type} - {event.src_path}")

    def should_process_changes(self) -> bool:
        """Check if enough time has passed since last event to process changes"""
        with self.lock:
            if not self.pending_changes:
                return False

            time_since_last = time.time() - self.last_event_time
            return time_since_last >= self.debounce_seconds

    def process_pending_changes(self) -> None:
        """Process all pending changes and invalidate cache"""
        with self.lock:
            if not self.pending_changes:
                return

            change_count = len(self.pending_changes)
            changed_files = list(self.pending_changes)
            self.pending_changes.clear()

        logger.info(f"Processing {change_count} file changes...")
        logger.debug(f"Changed files: {changed_files}")

        # Invalidate cache
        cache_service.invalidate("all_notes")
        cache_service.invalidate("search_index")
        cache_service.invalidate("vault_structure")

        # Call registered callbacks
        for callback in self.invalidation_callbacks:
            try:
                callback(changed_files)
            except Exception as e:
                logger.error(f"Error in invalidation callback: {e}")

        logger.info("Cache invalidated due to vault changes")


class FileWatcherService:
    """
    Background service that monitors Obsidian vault for changes.
    Automatically invalidates cache when files are modified.
    """

    def __init__(self, vault_path: str, debounce_seconds: float = 2.0):
        """
        Initialize file watcher

        Args:
            vault_path: Path to Obsidian vault directory
            debounce_seconds: Wait time before processing changes
        """
        self.vault_path = Path(vault_path)
        self.observer: Optional[Observer] = None
        self.handler = VaultFileHandler(debounce_seconds=debounce_seconds)
        self.processing_thread: Optional[Thread] = None
        self.stop_event = Event()
        self.is_running = False

        if not self.vault_path.exists():
            logger.warning(f"Vault path does not exist: {self.vault_path}")

    def add_invalidation_callback(self, callback: Callable) -> None:
        """Register a callback to be called when cache is invalidated"""
        self.handler.add_invalidation_callback(callback)

    def _processing_loop(self) -> None:
        """Background thread that processes pending changes"""
        logger.info("File watcher processing loop started")

        while not self.stop_event.is_set():
            try:
                if self.handler.should_process_changes():
                    self.handler.process_pending_changes()

                # Check every 0.5 seconds
                time.sleep(0.5)

            except Exception as e:
                logger.error(f"Error in file watcher processing loop: {e}")

        logger.info("File watcher processing loop stopped")

    def start(self) -> None:
        """Start watching the vault directory"""
        if self.is_running:
            logger.warning("File watcher is already running")
            return

        if not self.vault_path.exists():
            logger.error(
                f"Cannot start file watcher: vault path does not exist - {self.vault_path}"
            )
            return

        try:
            # Start watchdog observer
            self.observer = Observer()
            self.observer.schedule(self.handler, str(self.vault_path), recursive=True)
            self.observer.start()

            # Start processing thread
            self.stop_event.clear()
            self.processing_thread = Thread(target=self._processing_loop, daemon=True)
            self.processing_thread.start()

            self.is_running = True
            logger.info(f"File watcher started for vault: {self.vault_path}")

        except Exception as e:
            logger.error(f"Failed to start file watcher: {e}")
            self.stop()

    def stop(self) -> None:
        """Stop watching the vault directory"""
        if not self.is_running:
            return

        logger.info("Stopping file watcher...")

        # Stop observer
        if self.observer:
            self.observer.stop()
            self.observer.join(timeout=5)
            self.observer = None

        # Stop processing thread
        self.stop_event.set()
        if self.processing_thread:
            self.processing_thread.join(timeout=5)
            self.processing_thread = None

        self.is_running = False
        logger.info("File watcher stopped")

    def get_status(self) -> dict:
        """Get file watcher status"""
        return {
            "running": self.is_running,
            "vault_path": str(self.vault_path),
            "pending_changes": len(self.handler.pending_changes) if self.handler else 0,
        }


# Global file watcher instance (initialized on app startup)
_file_watcher: Optional[FileWatcherService] = None


def get_file_watcher() -> Optional[FileWatcherService]:
    """Get the global file watcher instance"""
    return _file_watcher


def initialize_file_watcher(vault_path: str) -> FileWatcherService:
    """Initialize and start the global file watcher"""
    global _file_watcher

    if _file_watcher is not None:
        logger.warning("File watcher already initialized")
        return _file_watcher

    _file_watcher = FileWatcherService(vault_path)
    _file_watcher.start()

    return _file_watcher


def shutdown_file_watcher() -> None:
    """Shutdown the global file watcher"""
    global _file_watcher

    if _file_watcher is not None:
        _file_watcher.stop()
        _file_watcher = None
