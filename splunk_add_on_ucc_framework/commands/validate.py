import logging
import sys

logger = logging.getLogger("ucc_gen")

try:
    from splunk_appinspect import main
except ImportError:
    logger.error(
        "UCC validate dependencies are not installed. Please install them using the command -> "
        "`pip install splunk-add-on-ucc-framework[validate]`."
    )
    sys.exit(1)


def validate(file_path: str) -> None:
    main.validate([f"{file_path}", "--included-tags", "cloud"])
