=========
Heartbeat
=========

Heartbeat is a Django app that runs custom test cases and stores the
results in the database.  Although there is only a single basic "200
Test Case" now, the idea is that we will continue to develop more complex
test cases and use this app as a watchdog for dependent architecture.

TODO: Add documentation for /api, and /views.

management / commands / checkpulse.py
-------------------------------------

Manage.py command to run all active tests.  The command runs the run_tests
function in models.py.

    python manage.py checkpulse

test_cases.py
-------------

The default location for test cases.  Developers should sub-class the
HeartBeatTestCase class add 1-n number of tests as functions using the
"test_" naming convention.  The test class uses this naming convention
to identify all of the tests it should run.  Every test function should
return a named tuple like the example below.

    test_result = namedtuple('test_2xx_results', ['result', 'latency',
                             'payload'])

1. TwoHundredTestCase
   A very basic test case that ensures a resource returns a 200 "OK" response.

2. register_test:
   A function used to register tests in the Heartbeat app.  You must
   register your tests in order to be able to assign them to new records.
   Call the register_test function with a HeartBeatTestCase subclassed test
   as the only argument.

3. get_test:
   When given a test name, returns that test from the "tests" dict.

4. HeartBeatTestCase:
   The base TestCase object, that every Heartbeat test case should inherit
   from.

   ### Attributes

       A. test_case: A python object that represents the object being tested.
          * The current implementation assumes the object is a record in the
            Harvester.Test model.
       B. url: The url that is tested.
       C. latencies: A list of latencies returned by a test cases' tests.
       D. responses: A list of responses returned by a test cases' tests.

   ### Methods

       A. setURL: Sets self.url in preparation for run().  This method
          assumes the object is a Harvester.Test model.

       B. methods_to_test: Identifies test cases by returning all methods that
          start with "test_".

       C. set_status: Sets the HarvesterTestCase status property to True if
          all tests are successful.

       D. status: Converts a tests output to a named tuple. << This method may
          be unnecessary, since the result is already a named tuple.

       E. run: Runs all of the tests returned by the object's methods_to_test
          method and saves the results.

models.py
---------

TESTS: Contstant that contains all registered tests from test_cases.py.  Add tests to this
by calling the register_test function (in test_cases.py) with a HeartBeatTestCase
subclassed test as the only argument.

GROUPS: List of tuples that define arbitary groups that a belongs to.

TEST_RESULT_CHOICES: A list of tuples that define the potential results of tests (ie Pass/Fail).

Base: An abstract class that contains metadata about a test.

Test: An object that represents a test that can be run.

TestRun: An 1:M object that stores metadata about when multiple tests are run.

TestRunResult: The output of a single test.

run_tests: Creates a TestRun and runs tests provided in a queryset argument.  If no queryset is provided
           the function runs all active tests.




