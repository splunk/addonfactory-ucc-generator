import json
import logging
import sys
import traceback

import import_declare_test
from solnlib import conf_manager, log
from splunklib import modularinput as smi

ADDON_NAME = "test_addon"


def logger_for_input(input_name: str) -> logging.Logger:
    return log.Logs().get_logger(f"{ADDON_NAME.lower()}_{input_name}")


def get_account_api_key(session_key: str, account_name: str):
    cfm = conf_manager.ConfManager(
        session_key,
        ADDON_NAME,
        realm=f"__REST_CREDENTIAL__#{ADDON_NAME}#configs/conf-test_addon_account",
    )
    account_conf_file = cfm.get_conf("test_addon_account")
    return account_conf_file.get(account_name).get("api_key")


def get_data_from_api(logger: logging.Logger, api_key: str):
    logger.info("Getting data from an external API")
    dummy_data = [
        {
            "line1": "hello",
        },
        {
            "line2": "world",
        },
    ]
    return dummy_data


class Input(smi.Script):
    def __init__(self):
        super().__init__()

    def get_scheme(self):
        scheme = smi.Scheme("my_first_input")
        scheme.description = "my_first_input input"
        scheme.use_external_validation = True
        scheme.streaming_mode_xml = True
        scheme.use_single_instance = False
        scheme.add_argument(
            smi.Argument(
                "name", title="Name", description="Name", required_on_create=True
            )
        )
        return scheme

    def validate_input(self, definition: smi.ValidationDefinition):
        return

    def stream_events(self, inputs: smi.InputDefinition, event_writer: smi.EventWriter):
        # inputs.inputs is a Python dictionary object like:
        # {
        #   "my_first_input://<input_name>": {
        #     "account": "<account_name>",
        #     "disabled": "0",
        #     "host": "$decideOnStartup",
        #     "index": "<index_name>",
        #     "interval": "<interval_value>",
        #     "python.version": "python3",
        #   },
        # }
        for input_name, input_item in inputs.inputs.items():
            normalized_input_name = input_name.split("/")[-1]
            logger = logger_for_input(normalized_input_name)
            try:
                session_key = self._input_definition.metadata["session_key"]
                log_level = conf_manager.get_log_level(
                    logger=logger,
                    session_key=session_key,
                    app_name=ADDON_NAME,
                    conf_name=f"{ADDON_NAME}_settings",
                )
                logger.setLevel(log_level)
                log.modular_input_start(logger, normalized_input_name)
                api_key = get_account_api_key(session_key, input_item.get("account"))
                data = get_data_from_api(logger, api_key)
                sourcetype = "dummy-data"
                for line in data:
                    event_writer.write_event(
                        smi.Event(
                            data=json.dumps(line, ensure_ascii=False, default=str),
                            index=input_item.get("index"),
                            sourcetype=sourcetype,
                        )
                    )
                log.events_ingested(
                    logger, normalized_input_name, sourcetype, len(data)
                )
                log.modular_input_end(logger, normalized_input_name)
            except Exception as e:
                logger.error(
                    f"Exception raised while ingesting data for "
                    f"my_first_input: {e}. Traceback: "
                    f"{traceback.format_exc()}"
                )


if __name__ == "__main__":
    exit_code = Input().run(sys.argv)
    sys.exit(exit_code)
