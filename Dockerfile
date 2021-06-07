FROM python:3.7

COPY dist/*.whl /tmp
RUN pip3.7 install $(ls /tmp/*.whl); rm -f /tmp/*.whl
WORKDIR /github/workspace
ENTRYPOINT [ "ucc-gen" ]