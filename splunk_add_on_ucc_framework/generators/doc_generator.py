from os.path import dirname, join, realpath

from splunk_add_on_ucc_framework.generators import GEN_FILE_LIST


def generate_docs() -> None:
    doc_content = []
    doc_content.append(
        """---
title: UCC framework generated files
---

Below table describes the files generated by UCC framework

## File Description
"""
    )
    doc_content.append("| File Name  | File Location | File Description |")
    doc_content.append("| ------------ | ------------ | ----------------- |")
    for f_tup in GEN_FILE_LIST:
        if isinstance(f_tup.file_path, str):
            # for conf files, REST handler scripts, mod-input scripts
            doc_content.append(
                f"| {f_tup.file_name} | output/&lt;YOUR_ADDON_NAME&gt;/{f_tup.file_path} | {f_tup.file_description} |"
            )
        if isinstance(f_tup.file_path, list):
            # for XML files
            doc_content.append(
                f"| {f_tup.file_name} | output/&lt;YOUR_ADDON_NAME&gt;/{'/'.join(f_tup.file_path)} "
                f"| {f_tup.file_description} | "
            )
    doc_content.append("\n")
    with open(
        join(
            realpath(dirname(dirname(dirname(__file__)))), "docs", "generated_files.md"
        ),
        "w",
    ) as writer:
        writer.write("\n".join(doc_content))


if __name__ == "__main__":
    generate_docs()