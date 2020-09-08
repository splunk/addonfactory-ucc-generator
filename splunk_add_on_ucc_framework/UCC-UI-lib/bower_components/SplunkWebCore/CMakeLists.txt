#
# install all of the appserver assets
#
	
INSTALL_AND_PACKAGE ( DIRECTORY app_templates DESTINATION share/splunk )
INSTALL_AND_PACKAGE ( DIRECTORY mbtiles DESTINATION share/splunk )
INSTALL_AND_PACKAGE ( DIRECTORY pdf DESTINATION share/splunk )

FOREACH(subdir exposed modules templates)
 	INSTALL_AND_PACKAGE ( DIRECTORY search_mrsparkle/${subdir} 
                            DONT_PACKAGE ${subdir}/css 
                            DONT_PACKAGE ${subdir}/js/splunkjs/css 
                            DONT_PACKAGE ${subdir}/testing 
                            DONT_PACKAGE ${subdir}/fixtures
                            DONT_PACKAGE ${subdir}/pages/styles.html
                            DONT_PACKAGE ${subdir}/less/readme.md
                            DONT_PACKAGE ${subdir}/less/docs
                            DONT_PACKAGE ${subdir}/less/Gruntfile.js
                            DONT_PACKAGE ${subdir}/less/package.json
                            DONT_PACKAGE ${subdir}/js/contrib/sinon*
                            DONT_PACKAGE ${subdir}/js/mocks
                            DONT_PACKAGE ${subdir}/js/fixtures
                            DONT_PACKAGE ${subdir}/qunit
                            DONT_PACKAGE ${subdir}/js/util/migrated
                            DONT_PACAKGE ${subdir}/js/util/qunit
                            DONT_PACKAGE ${subdir}/js/util/qunit_utils.js
                            DONT_PACKAGE ${subdir}/js/contrib/qunit-*.js
                            DONT_PACKAGE ${subdir}/js/contrib/qunit-assert-close.js
                            DONT_PACKAGE ${subdir}/js/contrib/sinon-*.js
                            DONT_PACKAGE ${subdir}/js/contrib/bootstrap-*/tests
                            DONT_PACKAGE ${subdir}/js/contrib/blanket-*
                            DONT_PACKAGE ${subdir}/less/contrib/bootstrap-*/tests
                            DONT_PACKAGE ${subdir}/docs/bubbles/wfs
                            DONT_PACKAGE ${subdir}/schema/trang.jar
                            DONT_PACKAGE ${subdir}/schema/update_rng.sh
                            DESTINATION share/splunk/search_mrsparkle )
ENDFOREACH(subdir)

# We unfortunately have to munge the permissions of share to allow splunkweb's
# SSL certs to be generted (see SPL-26262)  The underlying problem is that the
# certs aren't in the correct place (SPL-26275)  Once that latter bug is fixed
# this should go away:
IMPLICIT_PACKAGE_DIRECTORY_CHMOD ( 755 share/splunk )

# doing the same to fix SPL-30578
IMPLICIT_PACKAGE_DIRECTORY_CHMOD ( 755 share/splunk/search_mrsparkle )

# build Hunk assets if necessary
# IF ( WITH_hunk )
#        ADD_SUBDIRECTORY(${HUNK_SRC_DIR}/web    ${HUNK_SRC_DIR}/web)
# ENDIF (WITH_hunk)


IF (WITH_web_fail_soft)
    SET ( dont_bail "--dont-bail-on-error" )
ENDIF (WITH_web_fail_soft)

IF (WITH_web_dev)
    SET ( web_dev "--dev" )
ELSE (WITH_web_dev)
    SET ( web_dev "--run-once" )
ENDIF (WITH_web_dev)

IF (WITH_NODE)
    # Add a new target "web-static-assets" that will run a forced build of static assets
    ADD_CUSTOM_TARGET (
        web-static-assets
    )
    ADD_CUSTOM_NODEJS_COMMAND_TO_TARGET (
        web-static-assets
        POST_BUILD
        "${CMAKE_CURRENT_SOURCE_DIR}/build.js"
        "${dont_bail}"
        "-s" "${CMAKE_SOURCE_DIR}"
        "--splunkVersion" "${SPLUNK_VERSION}"
        "-b" "${CMAKE_BINARY_DIR}"
        "-H" "${SPLUNK_HOME}"
    )

    # Add a new target that is run with a regular make install
    # The script will only build if static assets haven't been build before
    ADD_CUSTOM_TARGET(
        web-static-assets-once
        ALL
    )
    ADD_CUSTOM_NODEJS_COMMAND_TO_TARGET (
        web-static-assets-once
        POST_BUILD
        "${CMAKE_CURRENT_SOURCE_DIR}/build.js"
        "${dont_bail}"
        "-s" "${CMAKE_SOURCE_DIR}"
        "--splunkVersion" "${SPLUNK_VERSION}"
        "-b" "${CMAKE_BINARY_DIR}"
        "-H" "${SPLUNK_HOME}"
        "${web_dev}"
        "--update-generated-list"
    )
ENDIF (WITH_NODE)
