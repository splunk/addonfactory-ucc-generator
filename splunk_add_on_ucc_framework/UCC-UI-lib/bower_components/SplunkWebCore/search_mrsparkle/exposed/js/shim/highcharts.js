define(
    [
        'jquery',
        'splunk',
        'highcharts.runtime_patches',
        'splunk-highcharts-no-conflict-loader!contrib/highcharts-4.0.4/highcharts'
    ],
    function(
        $,
        Splunk,
        runtimePatches,
        Highcharts
    ) {
    
    // The custom loader will remove Splunk's version of Highcharts from the global scope.
    // As a safety measure in case existing external code relies on this global,
    // it is still available as `Splunk.Highcharts`.
    Splunk.Highcharts = Highcharts;
    runtimePatches.applyPatches(Highcharts);
    return Highcharts;
});
