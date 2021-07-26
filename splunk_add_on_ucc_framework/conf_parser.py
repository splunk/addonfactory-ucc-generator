#
# Copyright 2021 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

"""
This class is used to override the Python built-in ConfigParser, because
TA builder needs to support:
1. Read/Write conf files with comments
2. Additional comment prefix such as *
3. Support multiline end with \

There are a lot of legacy codes here. If you want to see our changes,
please search: ######## tab_update ########
"""
import configparser

COMMENT_PREFIX = ";#*"
COMMENT_KEY = "__COMMENTS__"


class TABConfigParser(configparser.RawConfigParser):
    def _read(self, fp, fpname):
        """
        Override the built-in _read() method to read comments
        """
        from configparser import DEFAULTSECT, ParsingError

        cursect = None  # None, or a dictionary
        optname = None
        lineno = 0
        e = None  # None, or an exception

        ######## tab_update ########
        comment_index = 0
        self.top_comments = []
        self.fields_outside_stanza = []
        add_space_to_next_line = False
        ############################

        while True:
            line = fp.readline()
            if not line:
                break
            lineno = lineno + 1
            line = line.strip(" ")
            # comment or blank line?
            if line.strip() == "" or line[0] in COMMENT_PREFIX:

                ######## tab_update ########
                # save the lineno & comments
                if cursect:
                    name = "{}{}".format(COMMENT_KEY, comment_index)
                    comment_index += 1
                    cursect[name] = line
                else:
                    self.top_comments.append(line)
                continue
            ############################

            if line.split(None, 1)[0].lower() == "rem" and line[0] in "rR":
                # no leading whitespace
                continue
            # continuation line?

            ######## tab_update ########
            # support multiline with \
            if add_space_to_next_line:
                line = " " + line

            if line.strip().endswith("\\"):
                line = line.rstrip("\\ ")
                add_space_to_next_line = True
            else:
                add_space_to_next_line = False
            ############################

            if line[0].isspace() and cursect is not None and optname:
                value = line.strip()
                if value:
                    cursect[optname].append(value)
            # a section header or option header?
            else:
                # is it a section header?
                mo = self.SECTCRE.match(line)
                if mo:
                    sectname = mo.group("header")
                    if sectname in self._sections:
                        cursect = self._sections[sectname]
                    elif sectname == DEFAULTSECT:
                        cursect = self._defaults
                    else:
                        cursect = self._dict()
                        cursect["__name__"] = sectname
                        self._sections[sectname] = cursect
                        self._proxies[sectname] = configparser.SectionProxy(
                            self, sectname
                        )
                    # So sections can't start with a continuation line
                    optname = None
                # no section header in the file?

                elif cursect is None:
                    ######## tab_update ########
                    # disable the exception since splunk allows the field outside stanzas
                    #                     raise MissingSectionHeaderError(fpname, lineno, line)
                    self.fields_outside_stanza.append(line)
                ############################
                # an option line?
                else:
                    mo = self._optcre.match(line)
                    if mo:
                        optname, vi, optval = mo.group("option", "vi", "value")
                        optname = self.optionxform(optname.rstrip())
                        # This check is fine because the OPTCRE cannot
                        # match if it would set optval to None
                        if optval is not None:
                            if vi in ("=", ":") and ";" in optval:
                                # ';' is a comment delimiter only if it follows
                                # a spacing character
                                pos = optval.find(";")
                                if pos != -1 and optval[pos - 1].isspace():
                                    optval = optval[:pos]
                            optval = optval.strip()
                            # allow empty values
                            if optval == '""':
                                optval = ""
                            cursect[optname] = [optval]
                        else:
                            # valueless option handling
                            cursect[optname] = optval
                    else:
                        # a non-fatal parsing error occurred.  set up the
                        # exception but keep going. the exception will be
                        # raised at the end of the file and will contain a
                        # list of all bogus lines
                        if not e:
                            e = ParsingError(fpname)
                        e.append(lineno, repr(line))
        # if any parsing errors occurred, raise an exception
        if e:
            raise e

        # join the multi-line values collected while reading
        all_sections = [self._defaults]
        all_sections.extend(list(self._sections.values()))
        for options in all_sections:
            for name, val in list(options.items()):
                if isinstance(val, list):
                    options[name] = "\n".join(val)

    def write(self, fp):
        """
        Override the write() method to write comments
        """
        DEFAULTSECT = "DEFAULT"

        ######## tab_update ########
        if hasattr(self, "top_comments"):
            for comment in self.top_comments:
                fp.write(comment)

        if hasattr(self, "fields_outside_stanza"):
            for field in self.fields_outside_stanza:
                fp.write(field)
        ############################

        if self._defaults:
            fp.write("[%s]\n" % DEFAULTSECT)
            for (key, value) in list(self._defaults.items()):
                fp.write("{} = {}\n".format(key, str(value).replace("\n", "\n\t")))
            fp.write("\n")
        for section in self._sections:
            fp.write("[%s]\n" % section)
            for (key, value) in list(self._sections[section].items()):
                if key == "__name__":
                    continue

                ######## tab_update ########
                if key.startswith(COMMENT_KEY):
                    # only write the non empty line
                    if len(value.strip()) > 0:
                        fp.write(value)
                    # should continue as long as it is a comment line
                    continue
                ############################

                if (value is not None) or (self._optcre == self.OPTCRE):
                    key = " = ".join((key, str(value).replace("\n", "\n\t")))
                fp.write("%s\n" % (key))
            ######## tab_update ########
            # write the seperator line for stanza
            fp.write("\n")
            ############################

    def optionxform(self, optionstr):
        return optionstr

    def items(self, section):
        """
        Override the items() method to filter out the comments
        """
        items = configparser.RawConfigParser.items(self, section)

        res = []
        for k, v in items:
            if k.startswith(COMMENT_KEY):
                continue
            res.append((k, v))
        return res

    def options(self, section):
        options = configparser.RawConfigParser.options(self, section)

        res = []
        for opt in options:
            if opt.startswith(COMMENT_KEY):
                continue
            res.append(opt)

        return res

    def item_dict(self):
        res = {}
        sections = dict(self._sections)
        for section, key_values in list(sections.items()):
            kv = {}
            for k, v in list(key_values.items()):
                if (
                    not isinstance(k, str)
                    or k.startswith(COMMENT_KEY)
                    or k == "__name__"
                ):
                    continue
                kv[k] = v
            if kv:
                res[section] = kv
        return res
