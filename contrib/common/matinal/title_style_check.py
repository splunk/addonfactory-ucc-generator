import xml.etree.ElementTree as ET

import sys
import os
import argparse

# http://grammar.yourdictionary.com/capitalization/rules-for-capitalization-in-titles.html
coordinating_conjunctions = set(['and', 'but', 'or', 'nor', 'for', 'yet', 'so'])
# http://en.wikipedia.org/wiki/List_of_English_prepositions
prepositions = set(["a",
"abaft",
"abeam",
"aboard",
"about",
"above",
"absent",
"across",
"afore",
"after",
"against",
"along",
"alongside",
"amid",
"amidst",
"among",
"amongst",
"an",
"anenst",
"apropos",
"apud",
"around",
"as",
"aside",
"astride",
"at",
"athwart",
"atop",
"barring",
"before",
"behind",
"below",
"beneath",
"beside",
"besides",
"between",
"beyond",
"but",
"by",
"chez",
"circa",
"concerning",
"despite",
"during",
"except",
"excluding",
"failing",
"following",
"for",
"forenenst",
"from",
"given",
"in",
"including",
"inside",
"into",
"like",
"mid",
"midst",
"minus",
"modulo",
"near",
"next",
"notwithstanding",
"of",
"off",
"on",
"onto",
"opposite",
"out",
"outside",
"over",
"pace",
"per",
"plus",
"pro",
"qua",
"regarding",
"round",
"sans",
"save",
"since",
"than",
"through",
"thru",
"throughout",
"thruout",
"till",
"times",
"to",
"toward",
"towards",
"under",
"underneath",
"unlike",
"until",
"unto",
"up",
"upon",
"versus",
"vs.",
"via",
"vice",
"with",
"within",
"without",
"worth",
 ])

articles = set(['a', 'an', 'the'])

two_words_prepositions = set(["according to",
"ahead of",
"apart from",
"as for",
"as of",
"as per",
"as regards",
"aside from",
"astern of",
"back to",
"because of",
"close to",
"due to",
"except for",
"far from",
"in to",
"inside of",
"instead of",
"left of",
"near to",
"next to",
"on to",
"opposite of",
"opposite to",
"out from",
"out of",
"outside of",
"owing to",
"prior to",
"pursuant to",
"rather than",
"regardless of",
"right of",
"subsequent to",
"such as",
"thanks to",
"that of",
"up to"])

three_words_prepositions = set(['as opposed to', 'as soon as', 'as well as'])

single_word_lowercase = coordinating_conjunctions.union(prepositions).union(articles)
multi_words_lowercase = two_words_prepositions.union(three_words_prepositions)

glb_whitelist = set([])


def all_files(target_path, dir_filter=None,file_filter=None):
    for root, dirs, files in os.walk(target_path,followlinks=True):
        if dir_filter is None or dir_filter(root):
            for file in files:
                if file_filter is None or file_filter(file):
                    yield os.path.join(root, file)


def is_prebuilt_panel_dir(path):
    return isinstance(path, basestring) and os.path.basename(path) == 'panels'


def is_xml(file1):
    return isinstance(file1,basestring) and os.path.basename(file1).endswith('.xml')


def find_alpha(word):
    for i in range(len(word)):
        if word[i].isalpha():
            return i
    return None


def irregular(word):
    i=find_alpha(word)
    if i is None:
       return None
    for ch in word[i+1:]:
        if ch.isupper() and not word.isupper():
            return word[i:]
    return None


def realword(word):
    return word[find_alpha(word):]


def auto_capital(word):
    i=find_alpha(word)
    if i is None:
        return word
    return word[:i]+word[i:].capitalize()


def revise_single_word(word, middle=True):
    global glb_whitelist
    #word=str(word)
    if word.isupper() or word in glb_whitelist:
        return word
    elif middle and word in single_word_lowercase :
        return word.lower()
    else:
        return auto_capital(word)


def revise_multi_word(words):
    global glb_whitelist
    if not words:
        return None
    #word=str(word)

    origin=words[0]
    words[0]=realword(words[0])
    if words[0].isupper() or words[0] in glb_whitelist:
        return origin
    elif ' '.join(words[:3]).lower() in multi_words_lowercase \
            or ' '.join(words[:2]).lower() in multi_words_lowercase \
            or words[0].lower() in single_word_lowercase:
        return origin.lower()
    else:
        return auto_capital(origin)


def check_title(title, title_length=45):
    #title=str(title)
    warnings=[]
    if len(title)>title_length :
        warnings.append('Title length should be less than ' + str(title_length) + ' characters')

    title_array=title.split()
    length=len(title_array)
    for i in range(length):
        title_array[i]= revise_multi_word(title_array[i:i+3])

    title_array[0]=revise_single_word(title_array[0])
    title_array[-1]=revise_single_word(title_array[-1])

    revised=' '.join(title_array)

    if title != revised:
        warnings.append('Title capitalization or space may be incorrect; recommended title is "%s"' % revised)
    else:
        revised = ''

    if '-' not in title_array:
        warnings.append('Title style incorrect: missing " - " in title')

    return warnings, revised


def process_file(filepath, fix=False, clean=False, title_length=45,**kwargs):
    with open(filepath) as f:
        panel_xml = ET.parse(f)

    title_moved=False
    panel_title_element=panel_xml.find('title')
    if panel_title_element is None:
        panel_title_element=panel_xml.find('.//title')
        if panel_title_element is None:
            # print '--------ERROR--------'
            # print 'Path:',filepath
            # print 'ERROR: No title is found.'
            return
        else:
            title_moved=True
            if fix:
                panel_xml.find('.//title/..').remove(panel_title_element)
                panel_xml.getroot().insert(0,panel_title_element)

    warnings, revised = check_title(panel_title_element.text,title_length)

    if fix and revised:
        panel_title_element.text=revised

    if fix and (revised or title_moved):
        if not clean:
            i=0
            rename='%s.bak.%s'%(filepath,i)
            while os.path.exists(rename):
                i += 1
                rename = '%s.bak.%s'%(filepath,i)

            os.rename(filepath,rename)
        panel_xml.write(filepath)
    if title_moved:
        warnings.append('Title should be moved to the direct subelement of <panel>')
    # if warnings:
    #     print '--------WARNING--------'
    #     print 'Path:',filepath
    #     print 'Warnings:','\n          '.join(warnings)
    #     if fix and (revised or title_moved):
    #         print 'Notice: Fix mode enabled and capitalization and title movement is fixed into file.'
    #         print '        Backup file is created as %s'% os.path.basename(rename)
    # else:
    #     print '--OK--', filepath

    return warnings


def process_targets(targets, **kwargs):

    if not isinstance(targets,list):
        targets=[targets]
    for target in targets:
        if os.path.isdir(target):
            for filepath in all_files(target,is_prebuilt_panel_dir,is_xml):
                process_file(filepath, **kwargs)
        elif os.path.isfile(target) and is_xml(target):
            process_file(target, **kwargs)


def generate_whitelist_for_file(filepath):
    whitelist=[]
    with open(filepath) as f:
        panel_xml = ET.parse(f)
    panel_title_array=panel_xml.find('.//title').text.split()
    for word in panel_title_array:
        irr=irregular(word)
        if irr:
            whitelist.append(irr)
    return whitelist


def generate_whitelist(targets):
    whitelist=[]
    if not isinstance(targets,list):
        targets=[targets]
    for target in targets:
        if os.path.isdir(target):
            for filepath in all_files(target,is_prebuilt_panel_dir,is_xml):
                whitelist.extend(generate_whitelist_for_file(filepath))
        elif os.path.isfile(target) and is_xml(target):
            whitelist.extend(generate_whitelist_for_file(target))
    return set(whitelist)

if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('-nf','--no-fix', action='store_true',
                        help='Disable auto fixing. Useful if you only want to check panels.')

    parser.add_argument('-c','--clean', action='store_true',
                        help='Disable creating backup files when auto fixing.')

    parser.add_argument('-g','--generate', action='store_true',
                        help='auto-generate a white list file "./words-in-titles.wl". '
                             'Notice: if -g is set, no normal check will be done.')

    parser.add_argument('-w','--whitelist', nargs=1,
                        help='Specify a white list file. A white list file should have one or more lines, '
                             'each containing a case sensitive word to be whitelisted.')

    parser.add_argument('-aw','--auto-whitelist', action='store_true',
                        help='Auto-generate a whitelist and use it in check. White list is not saved on disk. Overwrites -w.')


    parser.add_argument('-l','--title-length', nargs=1, type=int, default=45,
                        help='Check title length within TITLE_LENGTH characters. Default 45.')


    parser.add_argument('target', nargs='*', help='Target files or dirs to run the program on. If no target is specified, it will be current working directory.')

    args=parser.parse_args(sys.argv[1:])

    if not args.target:
        args.target=['.']
        #args.target=['/Users/xuchen/Desktop/perforce/solutions/TA/TA-f5-bigip/mainline/package/default/data/ui/panels']

    abs_targets=[os.path.abspath(t) for t in args.target]

    if args.whitelist:
        with open(args.whitelist) as f:
            glb_whitelist=set(f.read().strip().splitlines())

    if args.auto_whitelist or args.generate:
        glb_whitelist=generate_whitelist(abs_targets)
        print '------------------'
        print 'Whitelist created:'
        print '------------------'
        for word in glb_whitelist:
            print word
        print '------------------'
    if args.generate:
        with open('words-in-title.wl','w') as f:
            f.write('\n'.join(glb_whitelist))
        sys.exit()

    for target in args.target:
        process_targets(abs_targets, fix=not args.no_fix, clean=args.clean, title_length=args.title_length)
    #process_target(os.path.abspath('/Users/xuchen/Desktop/perforce/solutions/TA/TA-aws/mainline/package'))
