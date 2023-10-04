import argparse
import sys


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-file", type=str, required=True)
    args = parser.parse_args()
    result = []
    if not sys.stdin.isatty():
        yarn_deps = sys.stdin.readlines()
        yarn_deps = yarn_deps[1:-1]
        for yarn_dep in yarn_deps:
            formatted_yarn_dep = yarn_dep.replace("├─ ", "").replace("└─ ", "")
            result.append(formatted_yarn_dep)
    with open(args.output_file, "w") as f:
        for line in result:
            f.writelines(line)


if __name__ == "__main__":
    main()
