import os
import sys
import logging

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from butler import CodeGenerator
from butler import Paths

class TestClass:

    logger = logging.getLogger('Test Butler')

    def setup_class(self):
        self.p = Paths(os.path.join(os.path.dirname(__file__), 'TA-paloalto'), '3.4.0')
        self.c = ''
        self.c += CodeGenerator.gen_eventtype_test(self.p)
        self.c += CodeGenerator.gen_eventtype_tag_test(self.p)
        self.c += CodeGenerator.gen_props_test(self.p)

    def test_eventtype_pan_threat(self):
        self.logger.debug("Testing eventtype pan_threat.")

        # run search
        result = self.c.find('"search eventtype=\\"pan_threat\\""')
        assert result >= 0

    def test_eventtype_pan_traffic(self):
        self.logger.debug("Testing eventtype pan_traffic.")

        # run search
        result = self.c.find('"search eventtype=\\"pan_traffic\\""')
        assert result >= 0

    def test_eventtype_pan_config(self):
        self.logger.debug("Testing eventtype pan_config.")

        # run search
        result = self.c.find('"search eventtype=\\"pan_config\\""')
        assert result >= 0

    def test_eventtype_pan_system(self):
        self.logger.debug("Testing eventtype pan_system.")

        # run search
        result = self.c.find('"search eventtype=\\"pan_system\\""')
        assert result >= 0

    def test_eventtype_pan(self):
        self.logger.debug("Testing eventtype pan.")

        # run search
        result = self.c.find('"search eventtype=\\"pan\\""')
        assert result >= 0

    def test_eventtype_pan_endpoint(self):
        self.logger.debug("Testing eventtype pan_endpoint.")

        # run search
        result = self.c.find('"search eventtype=\\"pan_endpoint\\""')
        assert result >= 0

    def test_eventtype_pan_threat_tag_attack(self):
        self.logger.debug("Testing eventtype=pan_threat tag=attack.")

        # run search
        result = self.c.find('"search eventtype=\\"pan_threat\\" tag=\\"attack\\"')
        assert result >= 0

    def test_eventtype_pan_threat_tag_ids(self):
        self.logger.debug("Testing eventtype=pan_threat tag=ids.")

        # run search
        result = self.c.find('"search eventtype=\\"pan_threat\\" tag=\\"ids\\"')
        assert result >= 0

    def test_eventtype_pan_traffic_tag_communicate(self):
        self.logger.debug("Testing eventtype=pan_traffic tag=communicate.")

        # run search
        result = self.c.find('"search eventtype=\\"pan_traffic\\" tag=\\"communicate\\"')
        assert result >= 0

    def test_eventtype_pan_traffic_tag_network(self):
        self.logger.debug("Testing eventtype=pan_traffic tag=network.")

        # run search
        result = self.c.find('"search eventtype=\\"pan_traffic\\" tag=\\"network\\"')
        assert result >= 0

    def test_eventtype_pan_config_tag_change(self):
        self.logger.debug("Testing eventtype=pan_config tag=change.")

        # run search
        result = self.c.find('"search eventtype=\\"pan_config\\" tag=\\"change\\"')
        assert result >= 0

    def test_eventtype_pan_system_tag_status(self):
        self.logger.debug("Testing eventtype=pan_system tag=status.")

        # run search
        result = self.c.find('"search eventtype=\\"pan_system\\" tag=\\"status\\"')
        assert result >= 0

    def test_eventtype_pan_system_tag_update(self):
        self.logger.debug("Testing eventtype=pan_system tag=update.")

        # run search
        result = self.c.find('"search eventtype=\\"pan_system\\" tag=\\"update\\"')
        assert result >= 0

    def test_eventtype_pan_tag_network(self):
        self.logger.debug("Testing eventtype=pan tag=network.")

        # run search
        result = self.c.find('"search eventtype=\\"pan\\" tag=\\"network\\"')
        assert result >= 0

    def test_eventtype_pan_endpoint_tag_operations(self):
        self.logger.debug("Testing eventtype=pan_endpoint tag=operations.")

        # run search
        result = self.c.find('"search eventtype=\\"pan_endpoint\\" tag=\\"operations\\"')
        assert result >= 0

    def test_eventtype_pan_endpoint_tag_malware(self):
        self.logger.debug("Testing eventtype=pan_endpoint tag=malware.")

        # run search
        result = self.c.find('"search eventtype=\\"pan_endpoint\\" tag=\\"malware\\"')
        assert result >= 0

    def test_eventtype_pan_endpoint_tag_attack(self):
        self.logger.debug("Testing eventtype=pan_endpoint tag=attack.")

        # run search
        result = self.c.find('"search eventtype=\\"pan_endpoint\\" tag=\\"attack\\"')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_receive_time(self):
        self.logger.debug("Testing sourcetype pan:threat field=receive_time.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat receive_time=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_serial_number(self):
        self.logger.debug("Testing sourcetype pan:threat field=serial_number.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat serial_number=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_type(self):
        self.logger.debug("Testing sourcetype pan:threat field=type.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat type=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_log_subtype(self):
        self.logger.debug("Testing sourcetype pan:threat field=log_subtype.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat log_subtype=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_generated_time(self):
        self.logger.debug("Testing sourcetype pan:threat field=generated_time.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat generated_time=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_src_ip(self):
        self.logger.debug("Testing sourcetype pan:threat field=src_ip.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat src_ip=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_src_ip_regex(self):
        self.logger.debug("Testing sourcetype pan:threat field=src_ip against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat src_ip!=\\"\\" | table src_ip", \'src_ip\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_src(self):
        self.logger.debug("Testing sourcetype pan:threat field=src.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat src=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_src_regex(self):
        self.logger.debug("Testing sourcetype pan:threat field=src against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat src!=\\"\\" | table src", \'src\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_dest_ip(self):
        self.logger.debug("Testing sourcetype pan:threat field=dest_ip.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat dest_ip=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_dest_ip_regex(self):
        self.logger.debug("Testing sourcetype pan:threat field=dest_ip against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat dest_ip!=\\"\\" | table dest_ip", \'dest_ip\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_dest(self):
        self.logger.debug("Testing sourcetype pan:threat field=dest.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat dest=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_dest_regex(self):
        self.logger.debug("Testing sourcetype pan:threat field=dest against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat dest!=\\"\\" | table dest", \'dest\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_src_translated_ip(self):
        self.logger.debug("Testing sourcetype pan:threat field=src_translated_ip.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat src_translated_ip=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_dest_translated_ip(self):
        self.logger.debug("Testing sourcetype pan:threat field=dest_translated_ip.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat dest_translated_ip=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_rule(self):
        self.logger.debug("Testing sourcetype pan:threat field=rule.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat rule=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_src_user(self):
        self.logger.debug("Testing sourcetype pan:threat field=src_user.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat src_user=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_dest_user(self):
        self.logger.debug("Testing sourcetype pan:threat field=dest_user.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat dest_user=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_app(self):
        self.logger.debug("Testing sourcetype pan:threat field=app.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat app=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_application(self):
        self.logger.debug("Testing sourcetype pan:threat field=application.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat application=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_virtual_system(self):
        self.logger.debug("Testing sourcetype pan:threat field=virtual_system.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat virtual_system=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_vsys(self):
        self.logger.debug("Testing sourcetype pan:threat field=vsys.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat vsys=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_src_zone(self):
        self.logger.debug("Testing sourcetype pan:threat field=src_zone.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat src_zone=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_dest_zone(self):
        self.logger.debug("Testing sourcetype pan:threat field=dest_zone.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat dest_zone=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_src_interface(self):
        self.logger.debug("Testing sourcetype pan:threat field=src_interface.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat src_interface=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_dest_interface(self):
        self.logger.debug("Testing sourcetype pan:threat field=dest_interface.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat dest_interface=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_log_forwarding_profile(self):
        self.logger.debug("Testing sourcetype pan:threat field=log_forwarding_profile.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat log_forwarding_profile=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_session_id(self):
        self.logger.debug("Testing sourcetype pan:threat field=session_id.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat session_id=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_repeat_count(self):
        self.logger.debug("Testing sourcetype pan:threat field=repeat_count.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat repeat_count=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_src_port(self):
        self.logger.debug("Testing sourcetype pan:threat field=src_port.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat src_port=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_src_port_regex(self):
        self.logger.debug("Testing sourcetype pan:threat field=src_port against regex: ^\\d+$.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat src_port!=\\"\\" | table src_port", \'src_port\', \'^\\d+$\'')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_dest_port(self):
        self.logger.debug("Testing sourcetype pan:threat field=dest_port.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat dest_port=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_dest_port_regex(self):
        self.logger.debug("Testing sourcetype pan:threat field=dest_port against regex: ^\\d+$.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat dest_port!=\\"\\" | table dest_port", \'dest_port\', \'^\\d+$\'')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_src_translated_port(self):
        self.logger.debug("Testing sourcetype pan:threat field=src_translated_port.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat src_translated_port=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_dest_translated_port(self):
        self.logger.debug("Testing sourcetype pan:threat field=dest_translated_port.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat dest_translated_port=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_flags(self):
        self.logger.debug("Testing sourcetype pan:threat field=flags.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat flags=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_protocol(self):
        self.logger.debug("Testing sourcetype pan:threat field=protocol.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat protocol=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_protocol_regex(self):
        self.logger.debug("Testing sourcetype pan:threat field=protocol against regex: UDP|udp|TCP|tcp.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat protocol!=\\"\\" | table protocol", \'protocol\', \'UDP|udp|TCP|tcp\'')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_vendor_protocol(self):
        self.logger.debug("Testing sourcetype pan:threat field=vendor_protocol.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat vendor_protocol=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_vendor_protocol_regex(self):
        self.logger.debug("Testing sourcetype pan:threat field=vendor_protocol against regex: UDP|udp|TCP|tcp.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat vendor_protocol!=\\"\\" | table vendor_protocol", \'vendor_protocol\', \'UDP|udp|TCP|tcp\'')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_action(self):
        self.logger.debug("Testing sourcetype pan:threat field=action.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat action=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_misc(self):
        self.logger.debug("Testing sourcetype pan:threat field=misc.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat misc=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_misc_regex(self):
        self.logger.debug("Testing sourcetype pan:threat field=misc against regex: .*/.*.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat misc!=\\"\\" | table misc", \'misc\', \'.*/.*\'')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_url(self):
        self.logger.debug("Testing sourcetype pan:threat field=url.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat url=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_url_regex(self):
        self.logger.debug("Testing sourcetype pan:threat field=url against regex: .*/.*.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat url!=\\"\\" | table url", \'url\', \'.*/.*\'')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_threat_name(self):
        self.logger.debug("Testing sourcetype pan:threat field=threat_name.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat threat_name=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_category(self):
        self.logger.debug("Testing sourcetype pan:threat field=category.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat category=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_severity(self):
        self.logger.debug("Testing sourcetype pan:threat field=severity.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat severity=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_direction(self):
        self.logger.debug("Testing sourcetype pan:threat field=direction.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat direction=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_sequence_number(self):
        self.logger.debug("Testing sourcetype pan:threat field=sequence_number.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat sequence_number=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_action_flags(self):
        self.logger.debug("Testing sourcetype pan:threat field=action_flags.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat action_flags=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_src_location(self):
        self.logger.debug("Testing sourcetype pan:threat field=src_location.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat src_location=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_dest_location(self):
        self.logger.debug("Testing sourcetype pan:threat field=dest_location.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat dest_location=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_content_type(self):
        self.logger.debug("Testing sourcetype pan:threat field=content_type.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat content_type=*')
        assert result >= 0

    #def test_props_sourcetype_pan__threat_field_pcap_id(self):
    #    self.logger.debug("Testing sourcetype pan:threat field=pcap_id.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:threat pcap_id=*')
    #    assert result >= 0

    #def test_props_sourcetype_pan__threat_field_file_digest(self):
    #    self.logger.debug("Testing sourcetype pan:threat field=file_digest.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:threat file_digest=*')
    #    assert result >= 0

    #def test_props_sourcetype_pan__threat_field_cloud_address(self):
    #    self.logger.debug("Testing sourcetype pan:threat field=cloud_address.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:threat cloud_address=*')
    #    assert result >= 0

    #def test_props_sourcetype_pan__threat_field_user_agent(self):
    #    self.logger.debug("Testing sourcetype pan:threat field=user_agent.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:threat user_agent=*')
    #    assert result >= 0

    #def test_props_sourcetype_pan__threat_field_filetype(self):
    #    self.logger.debug("Testing sourcetype pan:threat field=filetype.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:threat filetype=*')
    #    assert result >= 0

    #def test_props_sourcetype_pan__threat_field_xff(self):
    #    self.logger.debug("Testing sourcetype pan:threat field=xff.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:threat xff=*')
    #    assert result >= 0

    #def test_props_sourcetype_pan__threat_field_referrer(self):
    #    self.logger.debug("Testing sourcetype pan:threat field=referrer.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:threat referrer=*')
    #    assert result >= 0

    #def test_props_sourcetype_pan__threat_field_sender(self):
    #    self.logger.debug("Testing sourcetype pan:threat field=sender.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:threat sender=*')
    #    assert result >= 0

    #def test_props_sourcetype_pan__threat_field_subject(self):
    #    self.logger.debug("Testing sourcetype pan:threat field=subject.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:threat subject=*')
    #    assert result >= 0

    #def test_props_sourcetype_pan__threat_field_recipient(self):
    #    self.logger.debug("Testing sourcetype pan:threat field=recipient.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:threat recipient=*')
    #    assert result >= 0

    def test_props_sourcetype_pan__threat_field_report_id(self):
        self.logger.debug("Testing sourcetype pan:threat field=report_id.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat report_id=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_threat_id(self):
        self.logger.debug("Testing sourcetype pan:threat field=threat_id.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat threat_id=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_signature_id(self):
        self.logger.debug("Testing sourcetype pan:threat field=signature_id.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat signature_id=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_report_id(self):
        self.logger.debug("Testing sourcetype pan:threat field=report_id.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat report_id=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_dest_hostname(self):
        self.logger.debug("Testing sourcetype pan:threat field=dest_hostname.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat dest_hostname=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_major_content_type(self):
        self.logger.debug("Testing sourcetype pan:threat field=major_content_type.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat major_content_type=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_filename(self):
        self.logger.debug("Testing sourcetype pan:threat field=filename.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat filename=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_signature_id(self):
        self.logger.debug("Testing sourcetype pan:threat field=signature_id.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat signature_id=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_report_id(self):
        self.logger.debug("Testing sourcetype pan:threat field=report_id.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat report_id=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_vendor_protocol(self):
        self.logger.debug("Testing sourcetype pan:threat field=vendor_protocol.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat vendor_protocol=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_application(self):
        self.logger.debug("Testing sourcetype pan:threat field=application.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat application=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_url(self):
        self.logger.debug("Testing sourcetype pan:threat field=url.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat url=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_url_regex(self):
        self.logger.debug("Testing sourcetype pan:threat field=url against regex: .*/.*.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat url!=\\"\\" | table url", \'url\', \'.*/.*\'')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_src(self):
        self.logger.debug("Testing sourcetype pan:threat field=src.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat src=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_src_regex(self):
        self.logger.debug("Testing sourcetype pan:threat field=src against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat src!=\\"\\" | table src", \'src\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_dvc(self):
        self.logger.debug("Testing sourcetype pan:threat field=dvc.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat dvc=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_vsys(self):
        self.logger.debug("Testing sourcetype pan:threat field=vsys.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat vsys=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_dest(self):
        self.logger.debug("Testing sourcetype pan:threat field=dest.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat dest=*')
        assert result >= 0

    def test_props_sourcetype_pan__threat_field_dest_regex(self):
        self.logger.debug("Testing sourcetype pan:threat field=dest against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:threat dest!=\\"\\" | table dest", \'dest\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0

    def test_props_sourcetype_pan__system_field_receive_time(self):
        self.logger.debug("Testing sourcetype pan:system field=receive_time.")

        # run search
        result = self.c.find('"search sourcetype=pan:system receive_time=*')
        assert result >= 0

    def test_props_sourcetype_pan__system_field_serial_number(self):
        self.logger.debug("Testing sourcetype pan:system field=serial_number.")

        # run search
        result = self.c.find('"search sourcetype=pan:system serial_number=*')
        assert result >= 0

    def test_props_sourcetype_pan__system_field_type(self):
        self.logger.debug("Testing sourcetype pan:system field=type.")

        # run search
        result = self.c.find('"search sourcetype=pan:system type=*')
        assert result >= 0

    def test_props_sourcetype_pan__system_field_log_subtype(self):
        self.logger.debug("Testing sourcetype pan:system field=log_subtype.")

        # run search
        result = self.c.find('"search sourcetype=pan:system log_subtype=*')
        assert result >= 0

    def test_props_sourcetype_pan__system_field_generated_time(self):
        self.logger.debug("Testing sourcetype pan:system field=generated_time.")

        # run search
        result = self.c.find('"search sourcetype=pan:system generated_time=*')
        assert result >= 0

    #def test_props_sourcetype_pan__system_field_virtual_system(self):
    #    self.logger.debug("Testing sourcetype pan:system field=virtual_system.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:system virtual_system=*')
    #    assert result >= 0

    #def test_props_sourcetype_pan__system_field_vsys(self):
    #    self.logger.debug("Testing sourcetype pan:system field=vsys.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:system vsys=*')
    #    assert result >= 0

    def test_props_sourcetype_pan__system_field_event_id(self):
        self.logger.debug("Testing sourcetype pan:system field=event_id.")

        # run search
        result = self.c.find('"search sourcetype=pan:system event_id=*')
        assert result >= 0

    def test_props_sourcetype_pan__system_field_signature(self):
        self.logger.debug("Testing sourcetype pan:system field=signature.")

        # run search
        result = self.c.find('"search sourcetype=pan:system signature=*')
        assert result >= 0

    #def test_props_sourcetype_pan__system_field_object(self):
    #    self.logger.debug("Testing sourcetype pan:system field=object.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:system object=*')
    #    assert result >= 0

    def test_props_sourcetype_pan__system_field_module(self):
        self.logger.debug("Testing sourcetype pan:system field=module.")

        # run search
        result = self.c.find('"search sourcetype=pan:system module=*')
        assert result >= 0

    def test_props_sourcetype_pan__system_field_severity(self):
        self.logger.debug("Testing sourcetype pan:system field=severity.")

        # run search
        result = self.c.find('"search sourcetype=pan:system severity=*')
        assert result >= 0

    def test_props_sourcetype_pan__system_field_description(self):
        self.logger.debug("Testing sourcetype pan:system field=description.")

        # run search
        result = self.c.find('"search sourcetype=pan:system description=*')
        assert result >= 0

    def test_props_sourcetype_pan__system_field_sequence_number(self):
        self.logger.debug("Testing sourcetype pan:system field=sequence_number.")

        # run search
        result = self.c.find('"search sourcetype=pan:system sequence_number=*')
        assert result >= 0

    def test_props_sourcetype_pan__system_field_action_flags(self):
        self.logger.debug("Testing sourcetype pan:system field=action_flags.")

        # run search
        result = self.c.find('"search sourcetype=pan:system action_flags=*')
        assert result >= 0

    def test_props_sourcetype_pan__system_field_signature(self):
        self.logger.debug("Testing sourcetype pan:system field=signature.")

        # run search
        result = self.c.find('"search sourcetype=pan:system signature=*')
        assert result >= 0

    #def test_props_sourcetype_pan__system_field_vsys(self):
    #    self.logger.debug("Testing sourcetype pan:system field=vsys.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:system vsys=*')
    #    assert result >= 0

    def test_props_sourcetype_pan__system_field_dvc(self):
        self.logger.debug("Testing sourcetype pan:system field=dvc.")

        # run search
        result = self.c.find('"search sourcetype=pan:system dvc=*')
        assert result >= 0

    def test_props_sourcetype_pan__system_field_dvc_regex(self):
        self.logger.debug("Testing sourcetype pan:system field=dvc against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:system dvc!=\\"\\" | table dvc", \'dvc\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0

    def test_props_sourcetype_pan__system_field_dest(self):
        self.logger.debug("Testing sourcetype pan:system field=dest.")

        # run search
        result = self.c.find('"search sourcetype=pan:system dest=*')
        assert result >= 0

    def test_props_sourcetype_pan__system_field_dest_regex(self):
        self.logger.debug("Testing sourcetype pan:system field=dest against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:system dest!=\\"\\" | table dest", \'dest\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0

    def test_props_sourcetype_pan__endpoint_field_log_date(self):
        self.logger.debug("Testing sourcetype pan:endpoint field=log_date.")

        # run search
        result = self.c.find('"search sourcetype=pan:endpoint log_date=*')
        assert result >= 0

    def test_props_sourcetype_pan__endpoint_field_company(self):
        self.logger.debug("Testing sourcetype pan:endpoint field=company.")

        # run search
        result = self.c.find('"search sourcetype=pan:endpoint company=*')
        assert result >= 0

    def test_props_sourcetype_pan__endpoint_field_endpoint_product(self):
        self.logger.debug("Testing sourcetype pan:endpoint field=endpoint_product.")

        # run search
        result = self.c.find('"search sourcetype=pan:endpoint endpoint_product=*')
        assert result >= 0

    def test_props_sourcetype_pan__endpoint_field_endpoint_version(self):
        self.logger.debug("Testing sourcetype pan:endpoint field=endpoint_version.")

        # run search
        result = self.c.find('"search sourcetype=pan:endpoint endpoint_version=*')
        assert result >= 0

    def test_props_sourcetype_pan__endpoint_field_log_subtype_code(self):
        self.logger.debug("Testing sourcetype pan:endpoint field=log_subtype_code.")

        # run search
        result = self.c.find('"search sourcetype=pan:endpoint log_subtype_code=*')
        assert result >= 0

    def test_props_sourcetype_pan__endpoint_field_message(self):
        self.logger.debug("Testing sourcetype pan:endpoint field=message.")

        # run search
        result = self.c.find('"search sourcetype=pan:endpoint message=*')
        assert result >= 0

    def test_props_sourcetype_pan__endpoint_field_severity_code(self):
        self.logger.debug("Testing sourcetype pan:endpoint field=severity_code.")

        # run search
        result = self.c.find('"search sourcetype=pan:endpoint severity_code=*')
        assert result >= 0

    def test_props_sourcetype_pan__endpoint_field_additional_data(self):
        self.logger.debug("Testing sourcetype pan:endpoint field=additional_data.")

        # run search
        result = self.c.find('"search sourcetype=pan:endpoint additional_data=*')
        assert result >= 0

    def test_props_sourcetype_pan__endpoint_field_date(self):
        self.logger.debug("Testing sourcetype pan:endpoint field=date.")

        # run search
        result = self.c.find('"search sourcetype=pan:endpoint date=*')
        assert result >= 0

    def test_props_sourcetype_pan__endpoint_field_user(self):
        self.logger.debug("Testing sourcetype pan:endpoint field=user.")

        # run search
        result = self.c.find('"search sourcetype=pan:endpoint user=*')
        assert result >= 0

    def test_props_sourcetype_pan__endpoint_field_src_user(self):
        self.logger.debug("Testing sourcetype pan:endpoint field=src_user.")

        # run search
        result = self.c.find('"search sourcetype=pan:endpoint src_user=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_receive_time(self):
        self.logger.debug("Testing sourcetype pan:traffic field=receive_time.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic receive_time=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_serial_number(self):
        self.logger.debug("Testing sourcetype pan:traffic field=serial_number.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic serial_number=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_type(self):
        self.logger.debug("Testing sourcetype pan:traffic field=type.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic type=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_log_subtype(self):
        self.logger.debug("Testing sourcetype pan:traffic field=log_subtype.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic log_subtype=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_generated_time(self):
        self.logger.debug("Testing sourcetype pan:traffic field=generated_time.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic generated_time=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_src_ip(self):
        self.logger.debug("Testing sourcetype pan:traffic field=src_ip.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic src_ip=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_src_ip_regex(self):
        self.logger.debug("Testing sourcetype pan:traffic field=src_ip against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic src_ip!=\\"\\" | table src_ip", \'src_ip\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_src(self):
        self.logger.debug("Testing sourcetype pan:traffic field=src.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic src=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_src_regex(self):
        self.logger.debug("Testing sourcetype pan:traffic field=src against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic src!=\\"\\" | table src", \'src\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_dest_ip(self):
        self.logger.debug("Testing sourcetype pan:traffic field=dest_ip.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic dest_ip=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_dest_ip_regex(self):
        self.logger.debug("Testing sourcetype pan:traffic field=dest_ip against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic dest_ip!=\\"\\" | table dest_ip", \'dest_ip\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_dest(self):
        self.logger.debug("Testing sourcetype pan:traffic field=dest.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic dest=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_dest_regex(self):
        self.logger.debug("Testing sourcetype pan:traffic field=dest against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic dest!=\\"\\" | table dest", \'dest\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_src_translated_ip(self):
        self.logger.debug("Testing sourcetype pan:traffic field=src_translated_ip.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic src_translated_ip=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_dest_translated_ip(self):
        self.logger.debug("Testing sourcetype pan:traffic field=dest_translated_ip.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic dest_translated_ip=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_rule(self):
        self.logger.debug("Testing sourcetype pan:traffic field=rule.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic rule=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_src_user(self):
        self.logger.debug("Testing sourcetype pan:traffic field=src_user.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic src_user=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_dest_user(self):
        self.logger.debug("Testing sourcetype pan:traffic field=dest_user.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic dest_user=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_app(self):
        self.logger.debug("Testing sourcetype pan:traffic field=app.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic app=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_application(self):
        self.logger.debug("Testing sourcetype pan:traffic field=application.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic application=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_virtual_system(self):
        self.logger.debug("Testing sourcetype pan:traffic field=virtual_system.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic virtual_system=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_vsys(self):
        self.logger.debug("Testing sourcetype pan:traffic field=vsys.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic vsys=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_src_zone(self):
        self.logger.debug("Testing sourcetype pan:traffic field=src_zone.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic src_zone=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_dest_zone(self):
        self.logger.debug("Testing sourcetype pan:traffic field=dest_zone.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic dest_zone=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_src_interface(self):
        self.logger.debug("Testing sourcetype pan:traffic field=src_interface.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic src_interface=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_dest_interface(self):
        self.logger.debug("Testing sourcetype pan:traffic field=dest_interface.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic dest_interface=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_log_forwarding_profile(self):
        self.logger.debug("Testing sourcetype pan:traffic field=log_forwarding_profile.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic log_forwarding_profile=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_session_id(self):
        self.logger.debug("Testing sourcetype pan:traffic field=session_id.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic session_id=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_repeat_count(self):
        self.logger.debug("Testing sourcetype pan:traffic field=repeat_count.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic repeat_count=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_src_port(self):
        self.logger.debug("Testing sourcetype pan:traffic field=src_port.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic src_port=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_src_port_regex(self):
        self.logger.debug("Testing sourcetype pan:traffic field=src_port against regex: ^\\d+$.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic src_port!=\\"\\" | table src_port", \'src_port\', \'^\\d+$\'')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_dest_port(self):
        self.logger.debug("Testing sourcetype pan:traffic field=dest_port.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic dest_port=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_dest_port_regex(self):
        self.logger.debug("Testing sourcetype pan:traffic field=dest_port against regex: ^\\d+$.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic dest_port!=\\"\\" | table dest_port", \'dest_port\', \'^\\d+$\'')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_src_translated_port(self):
        self.logger.debug("Testing sourcetype pan:traffic field=src_translated_port.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic src_translated_port=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_dest_translated_port(self):
        self.logger.debug("Testing sourcetype pan:traffic field=dest_translated_port.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic dest_translated_port=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_flags(self):
        self.logger.debug("Testing sourcetype pan:traffic field=flags.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic flags=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_protocol(self):
        self.logger.debug("Testing sourcetype pan:traffic field=protocol.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic protocol=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_protocol_regex(self):
        self.logger.debug("Testing sourcetype pan:traffic field=protocol against regex: UDP|udp|TCP|tcp.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic protocol!=\\"\\" | table protocol", \'protocol\', \'UDP|udp|TCP|tcp\'')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_vendor_protocol(self):
        self.logger.debug("Testing sourcetype pan:traffic field=vendor_protocol.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic vendor_protocol=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_vendor_protocol_regex(self):
        self.logger.debug("Testing sourcetype pan:traffic field=vendor_protocol against regex: UDP|udp|TCP|tcp.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic vendor_protocol!=\\"\\" | table vendor_protocol", \'vendor_protocol\', \'UDP|udp|TCP|tcp\'')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_transport(self):
        self.logger.debug("Testing sourcetype pan:traffic field=transport.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic transport=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_transport_regex(self):
        self.logger.debug("Testing sourcetype pan:traffic field=transport against regex: UDP|udp|TCP|tcp.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic transport!=\\"\\" | table transport", \'transport\', \'UDP|udp|TCP|tcp\'')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_action(self):
        self.logger.debug("Testing sourcetype pan:traffic field=action.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic action=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_bytes(self):
        self.logger.debug("Testing sourcetype pan:traffic field=bytes.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic bytes=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_bytes_out(self):
        self.logger.debug("Testing sourcetype pan:traffic field=bytes_out.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic bytes_out=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_bytes_in(self):
        self.logger.debug("Testing sourcetype pan:traffic field=bytes_in.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic bytes_in=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_packets(self):
        self.logger.debug("Testing sourcetype pan:traffic field=packets.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic packets=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_start_time(self):
        self.logger.debug("Testing sourcetype pan:traffic field=start_time.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic start_time=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_duration(self):
        self.logger.debug("Testing sourcetype pan:traffic field=duration.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic duration=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_category(self):
        self.logger.debug("Testing sourcetype pan:traffic field=category.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic category=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_src_category(self):
        self.logger.debug("Testing sourcetype pan:traffic field=src_category.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic src_category=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_sequence_number(self):
        self.logger.debug("Testing sourcetype pan:traffic field=sequence_number.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic sequence_number=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_action_flags(self):
        self.logger.debug("Testing sourcetype pan:traffic field=action_flags.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic action_flags=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_src_location(self):
        self.logger.debug("Testing sourcetype pan:traffic field=src_location.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic src_location=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_dest_location(self):
        self.logger.debug("Testing sourcetype pan:traffic field=dest_location.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic dest_location=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_packets_out(self):
        self.logger.debug("Testing sourcetype pan:traffic field=packets_out.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic packets_out=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_packets_in(self):
        self.logger.debug("Testing sourcetype pan:traffic field=packets_in.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic packets_in=*')
        assert result >= 0

    #def test_props_sourcetype_pan__traffic_field_session_end_reason(self):
    #    self.logger.debug("Testing sourcetype pan:traffic field=session_end_reason.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:traffic session_end_reason=*')
    #    assert result >= 0

    def test_props_sourcetype_pan__traffic_field_src_category(self):
        self.logger.debug("Testing sourcetype pan:traffic field=src_category.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic src_category=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_vendor_protocol(self):
        self.logger.debug("Testing sourcetype pan:traffic field=vendor_protocol.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic vendor_protocol=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_transport(self):
        self.logger.debug("Testing sourcetype pan:traffic field=transport.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic transport=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_application(self):
        self.logger.debug("Testing sourcetype pan:traffic field=application.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic application=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_src(self):
        self.logger.debug("Testing sourcetype pan:traffic field=src.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic src=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_src_regex(self):
        self.logger.debug("Testing sourcetype pan:traffic field=src against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic src!=\\"\\" | table src", \'src\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_dvc(self):
        self.logger.debug("Testing sourcetype pan:traffic field=dvc.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic dvc=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_vsys(self):
        self.logger.debug("Testing sourcetype pan:traffic field=vsys.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic vsys=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_dest(self):
        self.logger.debug("Testing sourcetype pan:traffic field=dest.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic dest=*')
        assert result >= 0

    def test_props_sourcetype_pan__traffic_field_dest_regex(self):
        self.logger.debug("Testing sourcetype pan:traffic field=dest against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:traffic dest!=\\"\\" | table dest", \'dest\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_receive_time(self):
        self.logger.debug("Testing sourcetype pan:config field=receive_time.")

        # run search
        result = self.c.find('"search sourcetype=pan:config receive_time=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_serial_number(self):
        self.logger.debug("Testing sourcetype pan:config field=serial_number.")

        # run search
        result = self.c.find('"search sourcetype=pan:config serial_number=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_type(self):
        self.logger.debug("Testing sourcetype pan:config field=type.")

        # run search
        result = self.c.find('"search sourcetype=pan:config type=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_log_subtype(self):
        self.logger.debug("Testing sourcetype pan:config field=log_subtype.")

        # run search
        result = self.c.find('"search sourcetype=pan:config log_subtype=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_generated_time(self):
        self.logger.debug("Testing sourcetype pan:config field=generated_time.")

        # run search
        result = self.c.find('"search sourcetype=pan:config generated_time=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_dvc(self):
        self.logger.debug("Testing sourcetype pan:config field=dvc.")

        # run search
        result = self.c.find('"search sourcetype=pan:config dvc=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_dvc_regex(self):
        self.logger.debug("Testing sourcetype pan:config field=dvc against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:config dvc!=\\"\\" | table dvc", \'dvc\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_dest(self):
        self.logger.debug("Testing sourcetype pan:config field=dest.")

        # run search
        result = self.c.find('"search sourcetype=pan:config dest=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_dest_regex(self):
        self.logger.debug("Testing sourcetype pan:config field=dest against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:config dest!=\\"\\" | table dest", \'dest\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0

    #def test_props_sourcetype_pan__config_field_virtual_system(self):
    #    self.logger.debug("Testing sourcetype pan:config field=virtual_system.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:config virtual_system=*')
    #    assert result >= 0

    #def test_props_sourcetype_pan__config_field_vsys(self):
    #    self.logger.debug("Testing sourcetype pan:config field=vsys.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:config vsys=*')
    #    assert result >= 0

    def test_props_sourcetype_pan__config_field_command(self):
        self.logger.debug("Testing sourcetype pan:config field=command.")

        # run search
        result = self.c.find('"search sourcetype=pan:config command=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_cmd(self):
        self.logger.debug("Testing sourcetype pan:config field=cmd.")

        # run search
        result = self.c.find('"search sourcetype=pan:config cmd=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_admin(self):
        self.logger.debug("Testing sourcetype pan:config field=admin.")

        # run search
        result = self.c.find('"search sourcetype=pan:config admin=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_client(self):
        self.logger.debug("Testing sourcetype pan:config field=client.")

        # run search
        result = self.c.find('"search sourcetype=pan:config client=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_result(self):
        self.logger.debug("Testing sourcetype pan:config field=result.")

        # run search
        result = self.c.find('"search sourcetype=pan:config result=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_configuration_path(self):
        self.logger.debug("Testing sourcetype pan:config field=configuration_path.")

        # run search
        result = self.c.find('"search sourcetype=pan:config configuration_path=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_path(self):
        self.logger.debug("Testing sourcetype pan:config field=path.")

        # run search
        result = self.c.find('"search sourcetype=pan:config path=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_sequence_number(self):
        self.logger.debug("Testing sourcetype pan:config field=sequence_number.")

        # run search
        result = self.c.find('"search sourcetype=pan:config sequence_number=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_action_flags(self):
        self.logger.debug("Testing sourcetype pan:config field=action_flags.")

        # run search
        result = self.c.find('"search sourcetype=pan:config action_flags=*')
        assert result >= 0

    #def test_props_sourcetype_pan__config_field_before_change_detail(self):
    #    self.logger.debug("Testing sourcetype pan:config field=before_change_detail.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:config before_change_detail=*')
    #    assert result >= 0

    #def test_props_sourcetype_pan__config_field_after_change_detail(self):
    #    self.logger.debug("Testing sourcetype pan:config field=after_change_detail.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:config after_change_detail=*')
    #    assert result >= 0

    #def test_props_sourcetype_pan__config_field_vsys(self):
    #    self.logger.debug("Testing sourcetype pan:config field=vsys.")

        # run search
    #    result = self.c.find('"search sourcetype=pan:config vsys=*')
    #    assert result >= 0

    def test_props_sourcetype_pan__config_field_path(self):
        self.logger.debug("Testing sourcetype pan:config field=path.")

        # run search
        result = self.c.find('"search sourcetype=pan:config path=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_cmd(self):
        self.logger.debug("Testing sourcetype pan:config field=cmd.")

        # run search
        result = self.c.find('"search sourcetype=pan:config cmd=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_dvc(self):
        self.logger.debug("Testing sourcetype pan:config field=dvc.")

        # run search
        result = self.c.find('"search sourcetype=pan:config dvc=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_dvc_regex(self):
        self.logger.debug("Testing sourcetype pan:config field=dvc against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:config dvc!=\\"\\" | table dvc", \'dvc\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_dest(self):
        self.logger.debug("Testing sourcetype pan:config field=dest.")

        # run search
        result = self.c.find('"search sourcetype=pan:config dest=*')
        assert result >= 0

    def test_props_sourcetype_pan__config_field_dest_regex(self):
        self.logger.debug("Testing sourcetype pan:config field=dest against regex: ^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=pan:config dest!=\\"\\" | table dest", \'dest\', \'^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$\'')
        assert result >= 0