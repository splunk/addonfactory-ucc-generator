import os
import time

class TsidxUtil:
    
    def __init__(self, logger):
        """
        constructor of the TsidxUtil. The class is used to assist in functional testing.
        """
        self.logger = logger

    def verify_auto_tsidx_namespace_creation(self, auto_tsidx_path, datamodel_name, app="DM_Splunk_SA_CIM_"):
   	dirs = []
        self.logger.info("auto_tsidx_path '%s'",auto_tsidx_path)
        for d in os.listdir(auto_tsidx_path):
            if os.path.isdir(os.path.join(auto_tsidx_path,d)):
                dirs.append(os.path.join(auto_tsidx_path,d))
        	self.logger.info("dir '%s'", d)
        sorted_dir = list(sorted(dirs, key=lambda f: os.stat(f).st_mtime))
        self.logger.info("dir[0] '%s'", sorted_dir[len(sorted_dir)-1])

	dirs1 = []
 	for d in os.listdir(os.path.join(auto_tsidx_path, sorted_dir[len(sorted_dir)-1])):
            if os.path.isdir(os.path.join(auto_tsidx_path, sorted_dir[len(sorted_dir)-1], d)):
                dirs1.append(os.path.join(auto_tsidx_path, sorted_dir[len(sorted_dir)-1], d))
        self.logger.info("dir1[0] '%s'", dirs1[0] )
	
	datamodel = app + datamodel_name + "/" 
	auto_namespace_path = os.path.join(dirs1[0], datamodel)
        self.logger.info("auto_namespace_path '%s'", auto_namespace_path )
	assert os.path.isdir(auto_namespace_path)

	found = False
        for files in os.listdir(auto_namespace_path):
           self.logger.info("auto_namespace_path files '%s'", files)
           if files.endswith(".tsidx"):
	       found = True

	assert found

    def verify_auto_tsidx_namespace_thorough(self, auto_tsidx_path, datamodel_name, app="DM_Splunk_SA_CIM_", interval=60, retries=5):
        dirs = []
        tryNum = 0
        self.logger.info("Verifying TSIDX acceleration for " + datamodel_name)
        self.logger.info("auto_tsidx_path '%s'",auto_tsidx_path)
        while tryNum <= retries:
            self.logger.debug("Retries: %d", tryNum)
            for d in os.listdir(auto_tsidx_path):
                if os.path.isdir(os.path.join(auto_tsidx_path,d)):
                    dirs.append(os.path.join(auto_tsidx_path,d))
                self.logger.info("dir '%s'", d)
            dirs.sort(reverse=True)
    
            dirs1 = []
            for d in dirs:
                for d1 in os.listdir(os.path.join(auto_tsidx_path, d)):
                    if os.path.isdir(os.path.join(auto_tsidx_path, d, d1)):
                        dirs1.append(os.path.join(auto_tsidx_path, d, d1))
	            if (dirs1):
                        self.logger.info("dir1[-1] '%s'", dirs1[-1] )

            
            datamodel = app + datamodel_name + "/" 
            
            for d2 in dirs1:
                auto_namespace_path = os.path.join(d2, datamodel)
                self.logger.info("auto_namespace_path '%s'", auto_namespace_path)
                if os.path.isdir(auto_namespace_path) is True:
        
                    for files in os.listdir(auto_namespace_path):
                        self.logger.info("auto_namespace_path files '%s'", files)
                        if files.endswith(".tsidx"):
                            self.logger.info("datamodel: '" + datamodel_name + "' was found")
                            assert True
                            return
                    
            tryNum += 1
            time.sleep(interval)
        
        msg = "datamodel: '" + datamodel + "' was not accelerated"    
        assert False, msg
