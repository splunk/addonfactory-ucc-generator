__author__ = 'Zimo'

import getopt
import sys
import logging

from CaseGenerator import CaseGenerator
from DataModelParser import DataModelParser
from DataModelMatcher import DataModelMatcher
from FiledsComparer import FieldsComparer

logger = logging.getLogger("chamberlainLogger")
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

file_handler = logging.FileHandler("chamberlainLogger.log")
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.ERROR)
console_handler.setFormatter(formatter)

logger.addHandler(file_handler)
logger.addHandler(console_handler)


def main(argv):
    TA_path = ''
    data_model_path = ''
    filter_enabled = False
    try:
        opts, args = getopt.getopt(argv, 't:c:f')
    except getopt.GetoptError:
        print "-t <AddOn_path> -c <DM_path> [-f]"
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-t':
            TA_path = arg
        elif opt == '-c':
            data_model_path = arg
        elif opt == '-f':
            filter_enabled = True

    data_models = DataModelParser(path=data_model_path, logger=logger)
    dmMatcher = DataModelMatcher(TA_path=TA_path, logger=logger)
    data_models.print_data_models()
    dm_overlap = data_models.get_dm_overlap()
    data_models.print_dm_overlap()

    expected_models = dmMatcher.get_expected_models(data_models)
    # expected_dm_overlap = dmMatcher.get_expected_dm_obj_overlap(dm_overlap)

    actual_fields = dmMatcher.get_actual_fields()
    dmMatcher.print_expected_models()
    dmMatcher.print_unused_tags()
    dmMatcher.print_dm_overlap(dm_overlap)

    # compare expected fields and actually involved fields in props.conf, then generate comparison results
    fComparer = FieldsComparer(actual_fields, expected_models, TA_path, dmMatcher.get_TA_name(), logger)
    fComparer.compare_fields()
    fComparer.print_none_model_fields()

    # generate test cases based on expected data models and actually involved fields
    cGenerator = CaseGenerator(dmMatcher.get_TA_name())

    excludedFields = fComparer.get_excluded_fields() if filter_enabled  else ''
    code = cGenerator.gen_cim_mapping_test_suite(expected_models, excludedFields)
    cGenerator.write_to_file(code,
        "test_" + dmMatcher.get_TA_name().lower().replace('-', '_') + "_dm_mapping.py")

    logger.info("Chamberlain's job done.")


if __name__ == "__main__":
    main(sys.argv[1:])