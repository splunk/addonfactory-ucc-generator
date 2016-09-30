import sys
import time
from datetime import datetime
from selenium.webdriver.common.by import By


class ChartUtil:
      
    def __init__(self, logger):
        """
        Constructor of the ChartUtil object.
        """
        self.logger = logger
       
        self.logger.info("sys.path: " + str(sys.path))
       
        self.objects = {
            'container':
            {'by': By.CLASS_NAME, 'value': 'highcharts-container'},
            'title':
            {'by': By.CLASS_NAME, 'value': 'chartTitle'},
            'messageContainer': {'by': By.CLASS_NAME,
                                 'value': 'messageContainer'},
            'xaxis':
            {'by': By.CSS_SELECTOR, 'value': 'g.highcharts-axis text'},
            'yaxis':
            {'by': By.CLASS_NAME, 'value': 'highcharts-axis'},
            'xaxisTitle':
            {'by': By.CLASS_NAME, 'value': 'x-axis-title'},
            'yaxisTitle':
            {'by': By.CLASS_NAME, 'value': 'y-axis-title'},
            'legend':
            {'by': By.CLASS_NAME, 'value': 'highcharts-legend'},
            'axis-labels':
            {'by': By.CSS_SELECTOR, 'value': 'g.highcharts-axis-labels text tspan'},
            'tooltip':
            {'by': By.CSS_SELECTOR,
             'value': 'table.highcharts-tooltip'}
           
        }

    def get_horizontal_title(self, browser):
        '''
        Gets the list of horizontal title displayed in the JSChart

        @rtype: unicode strings
        @return: the horizontal title in the chart
        '''
        elems = browser.find_elements(**self.objects['xaxis'])
        return [elem.text.strip() for elem in elems]

    def get_vertical_title(self, browser):
        '''
        Gets the list of horizontal title displayed in the JSChart

        @rtype: unicode strings
        @return: the horizontal title in the chart
        '''
        elems = browser.find_elements(**self.objects['xaxis'])
        child_elems = elems[1].find_elements(By.TAG_NAME, 'text')
        return [elem.text.strip() for elem in child_elems]
    
    def get_xaxis_title(self, browser, highchart_num=0):
        '''
        Gets the chart's x-axis title if there is one

        @rtype: string
        @return: the chart's x-axis title
        '''
        script = '''
            chart = Splunk.Highcharts.charts[{j}];
            return chart.xAxis[0].axisTitle.textStr;
            '''.format(j=highchart_num)
        self.logger.info(" Java script '%s'", script)
        
        title = browser.browser.execute_script(script)
        self.logger.info(" Done get_xaxis_title  '%s'", title)
        return str(title)

    def get_yaxis_title(self, browser, highchart_num=0):
        '''
        Gets the chart's y-axis title if there is one

        @rtype: string
        @return: the chart's y-axis title
        '''
        self.logger.info(" In get_yaxis_title")
        script = '''
            chart = Splunk.Highcharts.charts[{j}];
            return chart.yAxis[0].axisTitle.textStr;
            '''.format(j=highchart_num)
        title = browser.browser.execute_script(script)
        self.logger.info(" Done get_yaxis_title '%s'", title)
        return str(title)

    def get_series_name(self, browser, for_series=0, highchart_num=0):
        '''
        Gets the name of the data series.

        @type for_series: int
        @param for_series: the series' index number in the data set.

        @rtype: string
        @return: the name of the series.
        '''
        script = '''
            chart = Splunk.Highcharts.charts[{j}];
            return chart.series[{s}].name
            '''.format(j=highchart_num, s=for_series)
        name = browser.browser.execute_script(script)
        return str(name)
   
    def get_number_of_series(self, browser, highchart_num=0):
        '''
        Get the number of series in the dataset for the given JSChart Id.

        @rtype: int
        @return: the number of series in the dataset.
        '''
        self.logger.info(" In get_number_of_series")
        script = '''
            chart = Splunk.Highcharts.charts[{j}];
            return chart.series.length;
            '''.format(j=highchart_num)
        self.logger.info(" script '%s'", script)
        value = browser.browser.execute_script(script)
        self.logger.info(" Done get_number_of_series '%s'", value)
        return int(value)

    def get_series_data_name(self, browser, for_series=0, data_num=0, highchart_num=0):
        '''
        Gets the name of the data series.

        @type for_series: int
        @param for_series: the series' index number in the data set.

        @type data_num: int
        @param data_num: the data index number in the series

        @rtype: string
        @return: the name of the data point in the series.
        '''
        script = '''
            chart = Splunk.Highcharts.charts[{j}];
            return chart.series[{s}].data[{d}].name
            '''.format(j=highchart_num, s=for_series, d=data_num)
        name = browser.browser.execute_script(script)
        return str(name)

    def get_number_of_data_points(self, browser, for_series=0, highchart_num=0):
        '''
        Gets the number of data points for a given series.

        @type for_series: int
        @param for_series: the index of the data series to count
        '''
        script = '''
            chart = Splunk.Highcharts.charts[{j}];
            return chart.series[{i}].data.length;
            '''.format(j=highchart_num, i=for_series)
        self.logger.info(" script '%s'", script)

        value = browser.browser.execute_script(script)
        self.logger.info(" Done get_number_of_data_points '%s'", value)
        return int(value)

    def get_number_of_multiseries_data_points(self, browser, for_series=0, y_category=0, highchart_num=0):
        '''
        Gets the number of data points for a given series on a given y-axis category

        @type for_series: int
        @param for_series: the index of the data series to count

        @type y_category: int
        @param y_category: the index of the y-axis category of the data series to count

        @type highchart_num: int
        @param highchart_num: the index of highchart to target
        '''
        def get_series_category_length(higchart_num, series, category):
            script = '''
            chart = Splunk.Highcharts.charts[{j}];
            return chart.series[{i}].data[{k}].y;
            '''.format(j=highchart_num, i=series, k=category)
            self.logger.info(" script '%s'", script)

            value = browser.browser.execute_script(script)
            self.logger.info(" Done get_series_length '%s'", value)
            return int(value)

        y_category_count = self.get_number_of_data_points(browser, for_series, highchart_num)
        # check if y-category for series is not empty is and non-zero
        if y_category_count > 0:
            series_data_length = get_series_category_length(highchart_num, for_series, y_category)
            if series_data_length > 0:
                return series_data_length
        return 0

    def get_total_pie_chart_data_points(self, browser, for_series=0, highchart_num=0):
        '''
        For pie charts: parses the 'other (x)' slice to get actual number of categories
        '''
        length = self.get_number_of_data_points(browser, for_series, highchart_num)
        for data_num in range(length):
            name = self.get_series_data_name(browser, for_series=for_series, data_num=data_num, highchart_num=highchart_num)
            if 'other (' in name:
                # Add the number from string: 'other(x)'
                # Using x - 1 because 'other' itself is a slice
                length += int(filter(str.isdigit, name)) - 1
        return length
    
    def get_number_of_categories(self, browser, highchart_num=0):
        '''
        Get the number of series in the dataset for the given JSChart Id.

        @rtype: int
        @return: the number of series in the dataset.
        '''
        self.logger.info(" In get_number_of_categories ")
        script = '''
            chart = Splunk.Highcharts.charts[{j}];
            return chart.xAxis[0].categories.length;
            '''.format(j=highchart_num)
            
        value = browser.browser.execute_script(script)
        self.logger.info(" Done get_number_of_categories '%s'", value)
        return int(value)
    
    def get_xaxis_category_list(self, browser, highchart_num=0):
        '''
        Get the number of series in the dataset for the given JSChart Id.

        @rtype: int
        @return: the number of series in the dataset.
        '''
        self.logger.info(" In get_xaxis_category_list ")
        script = '''
            chart = Splunk.Highcharts.charts[{j}];
            return chart.xAxis[0].categories;
            '''.format(j=highchart_num)
            
        category_list = browser.browser.execute_script(script)
        self.logger.info(" Done get_xaxis_category_list '%s'", category_list[0])
        return category_list
    
    def get_number_of_charts(self, browser):
        '''
        Gets the number of data points for a given series.

        @type for_series: int
        @param for_series: the index of the data series to count
        '''
      
        script = '''
            return Splunk.Highcharts.charts.length;
            '''
        self.logger.info(" script '%s'", script)
        
        value = browser.browser.execute_script(script)
        self.logger.info(" Done get_number_of_charts '%s'", value)
        return int(value)

    def click(self, browser, for_series=0, at_index=0, highchart_num=0):
        '''
        Does a javascript call to click the data point.
        DISCLAIMER: this action is not owned by splunk and is
        subjected to change through versions of highcharts.

        @type forSeries: int
        @param for_series: the series in the data to grab the tooltip for.

        @type at_index: int
        @param at_index: index from left to right starting at 0,
                        of the data point to grab the tooltip for.

        @type id: string
        @param id: id for the chart, but not implemented yet.
        '''
        self.logger.info(" In click")
        script = '''
            chart = Splunk.Highcharts.charts[{j}];
            chart.series[{s}].data[{i}].firePointEvent("click");
            '''.format(j=highchart_num, s=for_series, i=at_index)
        self.logger.info(" Java script '%s'", script)
        value = browser.execute_script(script)
        self.logger.info(" Done click ")
        return value

    def mouse_over(self, browser, for_series=0, at_index=0, highchart_num=0):
        '''
        Does a javascript call to mouseOver the data point.

        @type forSeries: int
        @param for_series: the series in the data to grab the tooltip for.

        @type at_index: int
        @param at_index: index from left to right starting at 0,
                        of the data point to grab the tooltip for.

        @type id: string
        @param id: id for the chart, but not implemented yet.
        '''
        self.logger.info(" In mouse_over")
        script = '''
            chart = Splunk.Highcharts.charts[{j}];
            chart.series[{s}].data[{i}].onMouseOver();
            '''.format(j=highchart_num, s=for_series, i=at_index)
        self.logger.info(" Java script '%s'", script)
        value = browser.browser.execute_script(script)
        self.logger.info(" Done mouse_over at ")
        return value

    def get_tooltip(self, browser):
        '''
        Gets the tooltip that is being displayed
        '''
        tooltip_elem = browser.find_elements(**self.objects['tooltip'])
        self.logger.info(" In tooltip_elem length: '%s'", len(tooltip_elem))
        
        tooltips = dict()
        if tooltip_elem:
            tspan_elems = tooltip_elem[0].find_elements(
                by=By.TAG_NAME, value='td')
            self.logger.info(" The element length: '%s'", len(tspan_elems))
            if tspan_elems:
                
                if len(tspan_elems) % 2 == 1:
                    self.logger.info(" In tspan elements '%s': ", tspan_elems[0].text)
                    tooltips['_time'] = tspan_elems[0].text
                
                    self.logger.info(" In tspan elements '%s': ", tspan_elems[1].text)
                    self.logger.info(" In tspan elements '%s': ", tspan_elems[2].text)
                    key = tspan_elems[1].text.strip().replace(":", "")
                    self.logger.info(" In tspan elements: ")
                    value = tspan_elems[2].text.strip().replace(":", "")
                    tooltips[key] = value
                else:
                    i=0
                    while(i < len(tspan_elems)):
                        key = tspan_elems[i].text.strip().replace(":", "")
                        self.logger.info(" In tspan elements: ")
                        value = tspan_elems[i+1].text.strip().replace(":", "")
                        tooltips[key] = value
                        i = i+2
                    
        return tooltips

    def get_tooltip_datapoints(self, browser, for_series_start=0, for_series_end=0, highchart_num=0):
        
        self.logger.info(" In get_tooltip_datapoints")
        for series in range(for_series_start, for_series_end+1):
            data_point_length = self.get_number_of_data_points(browser, series, highchart_num=highchart_num)
            self.logger.info(" In get_tooltip_datapoints length: '%s'", data_point_length)
            for count in range(data_point_length):
                script = '''
                chart = Splunk.Highcharts.charts[{k}];
                return chart.series[{i}].data[{j}].y;
                '''.format(k=highchart_num, i=series, j=count)

                event_count = browser.browser.execute_script(script)
                if (event_count is not None) and (int(event_count) > 0):
                    self.logger.info(" data_points_list y value > 0: '%s'", int(event_count))
                    self.mouse_over(browser, series, at_index=count, highchart_num=highchart_num)
                    time.sleep(10)
                    tooltips = self.get_tooltip(browser)

                    self.logger.info(" tooltips : '%s'", len(tooltips))
                    return tooltips

    def get_all_tooltip_datapoints(self, browser, for_series_start=0, for_series_end=0, highchart_num=0):
        self.logger.info(" In get_all_tooltip_datapoints")
        j = 0
        tooltips_list = {}
        for series in range(for_series_start, for_series_end+1):
            data_point_length = self.get_number_of_data_points(browser, for_series=series, highchart_num=highchart_num)
            self.logger.info(" In get_tooltip_datapoints length: '%s'", data_point_length)
            for count in range(data_point_length):
                script = '''
                chart = Splunk.Highcharts.charts[{k}];
                return chart.series[{i}].data[{j}].y;
                '''.format(k=highchart_num, i=series, j=count)

                event_count = browser.browser.execute_script(script)
                if (event_count is not None) and (int(event_count) > 0):
                    self.logger.info(" data_points_list y value > 0: '%s'", int(event_count))
                    self.mouse_over(browser, for_series=series, at_index=count, highchart_num=highchart_num)
                    time.sleep(10)
                    tooltips = self.get_tooltip(browser)

                    self.logger.info(" tooltips : '%s'", len(tooltips))
                    tooltips_list[j] = tooltips
                    j += 1
        return tooltips_list
    
    def get_last_tooltip_datapoint(self, browser, for_series_start=3, for_series_end=3, highchart_num=0):
        
        self.logger.info(" In get_last_tooltip_datapoint")
        j = 0
        tooltips_list = {}
        for series in range(for_series_start, for_series_end+1):
            data_point_length = self.get_number_of_data_points(browser, for_series=series, highchart_num=highchart_num)
            self.logger.info(" In get_tooltip_datapoints length: '%s'", data_point_length)
            
            for count in range(data_point_length-1, data_point_length):
                script = '''
                chart = Splunk.Highcharts.charts[{k}];
                return chart.series[{i}].data[{j}].y;
                '''.format(k=highchart_num, i=series, j=count)
                self.logger.info(" Java script '%s'", script)
                event_count = browser.browser.execute_script(script)
                if (event_count is not None) and (int(event_count) > 0):
                    self.logger.info(" data_points_list y value > 0: '%s'", int(event_count))
                    self.mouse_over(browser, for_series=series, at_index=count, highchart_num=highchart_num)
                    time.sleep(10)
                    tooltips = self.get_tooltip(browser)
                    
                    self.logger.info(" tooltips : '%s'", len(tooltips))
                    tooltips_list[j] = tooltips
                    j += 1
        return tooltips_list
    
    def get_first_two_tooltip_datapoint(self, browser, for_series_start=3, for_series_end=3, highchart_num=0):
        
        self.logger.info(" In get_tooltip_datapoints")
        j = 0
        tooltips_list = {}
        for series in range(for_series_start, for_series_end + 1):
            data_point_length = self.get_number_of_data_points(browser, for_series=series, highchart_num=highchart_num)
            self.logger.info(" In get_tooltip_datapoints length: '%s'", data_point_length)
            
            for count in range(data_point_length):
                script = '''
                chart = Splunk.Highcharts.charts[{k}];
                return chart.series[{i}].data[{j}].y;
                '''.format(k=highchart_num, i=series, j=count)
            
                event_count = browser.browser.execute_script(script)
                if (event_count is not None) and (int(event_count) > 0):
                    self.logger.info(" data_points_list y value > 0: '%s'", int(event_count))
                    self.mouse_over(browser, for_series=series, at_index=count, highchart_num=highchart_num)
                    time.sleep(10)
                    tooltips = self.get_tooltip(browser)
                    
                    self.logger.info(" tooltips : '%s'", len(tooltips))
                    tooltips_list[j] = tooltips
                    j += 1
                    if j == 2:
                        return tooltips_list
        
    def get_axis_labels_time_difference(self, browser, highchart_num):
        '''
        Gets the time difference between xaxis labels 
        '''
        self.logger.info(" In get_axis_labels")
        tooltips_list =  self.get_first_two_tooltip_datapoint(browser, highchart_num=highchart_num)
        self.logger.info(" tooltips_list length: '%s'", len(tooltips_list))
        self.logger.info(" tooltips_list: '%s'", tooltips_list)
        
        d1 = datetime.strptime(tooltips_list[0]['_time'], "%b %d, %Y %I:%M %p")
        first_time = time.mktime(d1.timetuple())
        d2 = datetime.strptime(tooltips_list[1]['_time'], "%b %d, %Y %I:%M %p")
        second_time = time.mktime(d2.timetuple())  
        
        if (second_time > first_time):
            time_diff = second_time-first_time
        else:
            time_diff = first_time-second_time
        self.logger.info("time_diff : '%s'",  time_diff)
        self.logger.info(" Done get_axis_labels")
        return int(time_diff)

    def get_last_axis_label_time_and_current_time_difference(self, browser, highchart_num):
        '''
        Gets the time difference between xaxis labels 
        '''
        self.logger.info(" In get_last_axis_label_time_and_current_time_difference")
        tooltips_list =  self.get_last_tooltip_datapoint(browser, highchart_num=highchart_num)
        self.logger.info(" tooltips_list length: '%s'", len(tooltips_list))
        self.logger.info(" tooltips_list: '%s'", len(tooltips_list))
                   
        d1 = datetime.strptime(tooltips_list[0]['_time'], "%b %d, %Y %I:%M %p")
        actual_time = time.mktime(d1.timetuple())  
        expected_time = time.time()+6000
        
        assert expected_time-actual_time <=1500 or actual_time-expected_time <=1500
       
        self.logger.info(" Done get_last_axis_label_time_and_current_time_difference")

    def drill_down(self, browser, for_series=0, highchart_num=0, click_last=False):

        self.logger.info(" In drill_down")
        data_point_length = self.get_number_of_data_points(browser, for_series, highchart_num)
        self.logger.info(" In get_tooltip_datapoints length: '%s'", data_point_length)

        if click_last:
            self.click(browser, for_series=for_series, at_index=data_point_length-1, highchart_num=highchart_num)
            return

        for count in range(data_point_length):
            script = '''
                chart = Splunk.Highcharts.charts[{k}];
                return chart.series[{i}].data[{j}].y;
            '''.format(k=highchart_num, i=for_series, j=count)
             
            event_count = browser.browser.execute_script(script)
            if (event_count is not None) and (int(event_count) > 0):
                self.logger.info(" data_points_list y value > 0: '%s'", event_count)
                self.click(browser, for_series=for_series, at_index=count, highchart_num=highchart_num)
                return
