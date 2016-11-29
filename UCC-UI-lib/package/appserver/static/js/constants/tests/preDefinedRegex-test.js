import assert from 'assert';
import {REGEX_URL, REGEX_EMAIL, REGEX_IPV4, REGEX_DATE} from '../preDefinedRegex';

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
            assert.equal(true, REGEX_URL.test('ftp://www.splunk.com/:800'));
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
        });

        it('A wrong email should not match regex', () => {
            assert.equal(false, REGEX_EMAIL.test('wguan%splunk.com'));
        });
    });

    describe('Regex for ipv4 should works', () => {
        it('A normal ip should match regex', () => {
            assert.equal(true, REGEX_IPV4.test('127.0.0.3'));
        });

        it('A wrong ip should not match regex', () => {
            assert.equal(false, REGEX_IPV4.test('127.0.0.300'));
        });
    });

    describe('Regex for date should works', () => {
        it('A normal date should match regex', () => {
            assert.equal(true, REGEX_DATE.test('29/3/2015'));
        });

        it('A wrong date should not match regex', () => {
            assert.equal(false, REGEX_DATE.test('40/3/2015'));
        });
    });
});
