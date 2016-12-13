import assert from 'assert';
import {REGEX_URL, REGEX_EMAIL, REGEX_IPV4, REGEX_DATE} from 'app/constants/preDefinedRegex';

describe('Predefined regex testes', () => {
    describe('Regex for URL should works', () => {
        it('A normal url should match regex', () => {
            assert.equal(true, REGEX_URL.test('https://www.splunk.com/'));
        });

        it('A normal url with port should match regex', () => {
            assert.equal(true, REGEX_URL.test('https://www.splunk.com/:800'));
        });

        it('A url without protocol should match regex', () => {
            assert.equal(true, REGEX_URL.test('www.splunk.com/:800'));
        });

        it('A url with ftp protocol should match regex', () => {
            assert.equal(true, REGEX_URL.test('ftp://www.splunk.com/:8800'));
        });

        it('A url with for opc.tcp protocol should match regex', () => {
            assert.equal(true, REGEX_URL.test('opc.tcp://www.splunk.com/:800'));
        });

        it('A url with opc.tcp protocol should match regex', () => {
            assert.equal(true, REGEX_URL.test('opc.tcp://www.splunk.com/:800'));
        });

        it('A wrong url should not match regex', () => {
            assert.equal(false, REGEX_URL.test('%splunk.com/:800'));
        });
    });

    describe('Regex for email should works', () => {
        it('A normal email should match regex', () => {
            assert.equal(true, REGEX_EMAIL.test('wguan@splunk.com'));
            assert.equal(true, REGEX_EMAIL.test('wguan@gmail.com'));
            assert.equal(true, REGEX_EMAIL.test('wguan@hotmail.com'));
            assert.equal(true, REGEX_EMAIL.test('wguan@hotmail.com'));
        });

        it('A wrong email should not match regex', () => {
            assert.equal(false, REGEX_EMAIL.test('wguan%splunk.com'));
        });
    });

    describe('Regex for ipv4 should works', () => {
        it('A normal ip should match regex', () => {
            assert.equal(true, REGEX_IPV4.test('127.0.0.3'));
            assert.equal(true, REGEX_IPV4.test('255.255.255.255'));
            assert.equal(true, REGEX_IPV4.test('0.0.0.0'));
        });

        it('A wrong ip should not match regex', () => {
            assert.equal(false, REGEX_IPV4.test('127.0.0.300'));
        });
    });

    describe('Regex for date should be valid for ISO8601 date string', () => {
        it('A normal ISO8601 date should match regex', () => {
            assert.equal(true, REGEX_DATE.test('2016-07-16'));
            assert.equal(true, REGEX_DATE.test('2016-07-16T19:20:30.45'));
        });

        it('A wrong ISO8601 date should not match regex', () => {
            assert.equal(false, REGEX_DATE.test('2015-3-19'));
        });

        it('Date with YYYY-MM-DDThh:mm:ss.sTZD format should works', () => {
            assert.equal(true, REGEX_DATE.test('1997-07-16T19:20:30.45+01:00'));
        });
    });
});
