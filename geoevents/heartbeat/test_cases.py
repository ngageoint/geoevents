# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

import sys
import time
import urllib2
from collections import namedtuple
from urllib2 import URLError, HTTPError

tests = dict()


def register_test(test):
    """
    A function used to register tests in the Heartbeat app.  You must register your tests in order to be able to assign
    them to new records.
    """
    tests[test.test_name] = test


def get_test(test_name):
    """
    When given a test name, returns that test from the "tests" dict.
    """
    return tests[test_name]


class HeartBeatTestCase(object):
    """
    A base test case class for the Heartbeat module.
    """

    test_name = 'Name of Test'
    description = 'Description of Test'


    def __init__(self, test_case, **kwargs):
        self.test_case = test_case
        self.url = None
        self.latencies = []
        self.responses = []

        for key, value in kwargs.iteritems():
            setattr(self, key, value)

        self.setURL()

    def setURL(self):
        """
        Sets self.url in preparation for run()
        """
        try:
            if self.test_case.table and self.test_case.object_id:
                self.url = self.test_case.table.get_object_for_this_type(id=self.test_case.object_id) \
                    .__getattribute__(self.test_case.urlorfield)
            else:
                self.url = self.test_case.urlorfield
        except:
            self.url = self.test_case.urlorfield

        return self.url

    def methods_to_test(self):
        """
        Identifies test cases by returning all methods that start with "test_"
        """
        return [method for method in dir(self) if (callable(getattr(self, method)) and method.startswith('test_'))]

    def set_status(self, results):
        """
        Sets the HarvesterTestCase status property to True if all tests are successful
        """
        if results.successful and not results.failure:
            self.successful = True
        else:
            self.successful = False

        return self.successful

    def status(self, function, result, latency=0, payload=None):
        """
        Converts a tests output to a namedtuple.
        """
        test_result = namedtuple('TestResult', ['result', 'f', 'latency', 'payload'])
        return test_result(result=result, f=function, latency=latency, payload=payload)

    def run(self):
        """
        Runs all test methods for the test class
        """
        successes = []
        failures = []
        test_case_result = namedtuple('TestCaseResults', ['successful', 'failure'])

        for i in self.methods_to_test():
            result = self.status(i, *getattr(self, i)())

            self.responses.append(result.payload)
            self.latencies.append(result.latency)

            if result.result:
                successes.append(result)
            else:
                failures.append(result)

        test_results = test_case_result(successful=successes, failure=failures)
        self.set_status(test_results)
        return test_results


class TwoHundredTestCase(HeartBeatTestCase):
    test_name = '200 Test'
    description = 'Makes a GET request that expects a 200 level response'

    def test_2xx(self, append_payload_if_successful=False):
        """
        Verifies that the classes URL returns a 200 response on GET requests.
        """

        test_result = namedtuple('test_2xx_results', ['result', 'latency', 'payload'])
        result = False
        latency = 0
        payload = None
        request_timeout = 15 # seconds

        try:
            start = time.time()
            resp = urllib2.urlopen(self.url, timeout=request_timeout)
            end = time.time()
            latency = str(round(end - start, 3))
            self.latencies.append(latency)

            if resp and 200 >= resp.code <= 299:
                result = True

                if append_payload_if_successful:
                    payload = resp.readlines()
                else:
                    payload = self.url

                resp.close()

            elif resp:
                ## not a 2xx response
                payload = resp.readlines()
                resp.close()

            else:
                ## no response object
                payload = 'No response object.'

        except HTTPError as e:
            payload = 'HTTP error, code:{}'.format(e.code)
            latency = latency
            payload = e.msg

        except URLError:
            payload = 'Request exceeded timeout {0} seconds.'.format(request_timeout)
            latency = request_timeout

        except:
            payload = sys.exc_info()

        finally:
            return test_result(result=result, latency=latency, payload=payload)


register_test(TwoHundredTestCase)



