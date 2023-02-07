import configparser
import json as json_lib
from pathlib import Path
from typing import Any, List


class Validate(object):
    def __init__(self) -> None:
        pass

    @staticmethod
    def file(*, path: Path) -> bool:
        if not path.exists() or not path.is_file():
            raise FileNotFoundError(f"File {path} does not exist")

    @staticmethod
    def dir(*, path: Path, additional_error_message: str=None) -> None:
        if not path.exists() or not path.is_dir():
            error_message = f"Given address ({path}) does not point to existing directory"
            if additional_error_message:
                error_message += f"\n{additional_error_message}"
            raise NotADirectoryError(error_message)

class Load(object):
    def __init__(self) -> None:
        pass

    @staticmethod
    def json(*, path: Path) -> Any:
        Validate.file(path=path)
        with open(path) as f:
            return json_lib.load(f)

    @staticmethod
    def config(*, path: Path) -> List[str]:
        Validate.file(path=path)
        config = configparser.ConfigParser()
        return config.read(path)
