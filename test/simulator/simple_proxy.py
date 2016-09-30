import select
import socket
import thread

BUFFER_LENGTH = 1024 * 8
HTTP_VERSION = 'HTTP/1.1'


class ConnectionHandler:
    def __init__(self, connection, _):
        self.client = connection
        self.client_buffer = ''
        self.timeout = 60
        self.method, self.path, self.protocol = self.get_base_header()
        if self.method == 'CONNECT':
            self.method_connect()
        elif self.method in ('OPTIONS', 'GET', 'HEAD', 'POST', 'PUT',
                             'DELETE', 'TRACE'):
            self.method_others()
        self.client.close()
        self.target.close()

    def get_base_header(self):
        end = None
        while 1:
            self.client_buffer += self.client.recv(BUFFER_LENGTH)
            end = self.client_buffer.find('\n')
            if end != -1:
                break
        print '%s' % self.client_buffer[:end]
        data = (self.client_buffer[:end+1]).split()
        self.client_buffer = self.client_buffer[end+1:]
        return data

    def method_connect(self):
        self._connect_target(self.path)
        self.client.send(HTTP_VERSION + ' 200 Connection established\nProxy-agent: Python Proxy\n\n')
        self.client_buffer = ''
        self._read_write()

    def method_others(self):
        self.path = self.path[7:]
        i = self.path.find('/')
        host = self.path[:i]
        path = self.path[i:]
        self._connect_target(host)
        self.target.send('%s %s %s\n'%(self.method, path, self.protocol)+
                         self.client_buffer)
        self.client_buffer = ''
        self._read_write()

    def _connect_target(self, host):
        i = host.find(':')
        if i!=-1:
            port = int(host[i+1:])
            host = host[:i]
        else:
            port = 80
        (soc_family, _, _, _, address) = socket.getaddrinfo(host, port)[0]
        self.target = socket.socket(soc_family)
        self.target.connect(address)

    def _read_write(self):
        time_out_max = self.timeout / 3
        socs = [self.client, self.target]
        count = 0
        while 1:
            count += 1
            (receive, _, error) = select.select(socs, [], socs, 3)
            if error:
                break
            if receive:
                for ingress in receive:
                    data = ingress.recv(BUFFER_LENGTH)
                    if ingress is self.client:
                        out = self.target
                    else:
                        out = self.client
                    if data:
                        out.send(data)
                        count = 0
            if count == time_out_max:
                break


def start_proxy(host='localhost', port=8080):
    soc = socket.socket(socket.AF_INET)
    soc.bind((host, port))
    soc.listen(0)
    while True:
        thread.start_new_thread(ConnectionHandler, soc.accept())
