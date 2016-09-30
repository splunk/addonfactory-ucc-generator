from Utils.SubModularLogger import SubModularLogger
from Utils.SubModularArgParser import SubModularArgParser
from Utils.UpdateSubmodule import UpdateSubmodular
from Utils import SubmodularUtils

if __name__ == "__main__":
    '''
    SubModular Starts Running.
    '''
    submodular_logger = SubModularLogger().get_logger()
    submodular_logger.info("Starting SubModular Tool...")
    
    submodular_args = SubModularArgParser().parse_submodular_args()
    submodular_logger.info("THE SUB-MODULAR COMMAND LINE ARGS ARE %s", submodular_args)
        
    if submodular_args.update:
        update_submodule = UpdateSubmodular(submodular_logger, submodular_args)
    
    submodular_logger.info("Completed Running SubModular.")