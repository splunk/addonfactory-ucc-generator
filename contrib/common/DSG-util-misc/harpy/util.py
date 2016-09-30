import ConfigParser


SAVEDSEARCHES_FIELDS_MAP = {}


def parse_savedsearches(file_path):
    savedsearches_config = ConfigParser.RawConfigParser()
    savedsearches_config.read(file_path)

    search_list = []
    for section in savedsearches_config.sections():
        if savedsearches_config.has_option(section, 'search'):
            search_content = {'search': savedsearches_config.get(section, 'search')}
            for field in SAVEDSEARCHES_FIELDS_MAP.keys():
                if savedsearches_config.has_option(section, field):
                    search_content[SAVEDSEARCHES_FIELDS_MAP[field]] = savedsearches_config.get(section, field)
            search_list.append(search_content)

    return search_list


def parse_panel(file_path):
    pass


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('file_path')
    args = parser.parse_args()
    print parse_savedsearches(args.file_path)
