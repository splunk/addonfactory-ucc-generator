<?xml version="1.0" encoding="UTF-8"?>
<!--  -->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:strip-space elements="*" />
<xsl:preserve-space elements="v" />
<xsl:output method="html" indent="no" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" />

<!--============================================================================
  - Root template matches <results>
  -
  ===========================================================================-->
<xsl:template match="/">
	<div><xsl:apply-templates select="results/result"/></div>
</xsl:template>

<xsl:template match="result">
	<div class="event">
		<div class="eventTime">
			<xsl:apply-templates select="field[@k='_time']"/>
		</div>
		<div class="eventBody">
			<pre class="eventRaw">
				<xsl:apply-templates select="field[@k='_raw']"/>
			</pre>
			<div class="eventFields">
				<xsl:apply-templates select="field[@k!='_raw' and @k!='_time']"/>
			</div>
		</div>
	</div>
	<br/>
</xsl:template>


<xsl:template match="field[@k='_time']">
	<xsl:value-of select="value/text" />
</xsl:template>

<xsl:template match="field[@k='_raw']">
	<xsl:apply-templates select="v" />
</xsl:template>

<xsl:template match="field[@k!='_raw' and @k!='_time']">
    <span class="field">	   
		<span class="key"><xsl:value-of select="@k" /></span>
		<xsl:text>=</xsl:text>
		<xsl:for-each select="value">
			<span termkey="{../@k}" term="{.}">
				<xsl:attribute name="class">
					<xsl:text>value srch</xsl:text>
					<xsl:if test="./@h='1'">
						<xsl:text> searchTermHighlight</xsl:text>
					</xsl:if>
				</xsl:attribute>
				<xsl:apply-templates select="text"/>
			</span>	
			<xsl:text> </xsl:text>
			<xsl:for-each select="tag">
				<em><span termkey="tag::{../../@k}" term="{.}">
					<xsl:attribute name="class">
						<xsl:text>value srch</xsl:text>
					</xsl:attribute>
					<xsl:apply-templates/>
				</span></em>
			</xsl:for-each>
		</xsl:for-each>
		<xsl:if test="position() != last()">
			<xsl:text>&#160;|&#160;</xsl:text>
		</xsl:if>
	</span>
</xsl:template> 


<xsl:template match="v">
	<xsl:apply-templates />
</xsl:template>

<xsl:template match="sg">
	<span>
		<xsl:attribute name="class">
			<xsl:text>srch</xsl:text>
			<xsl:if test="@h">
				<xsl:text> searchTermHighlight</xsl:text>
			</xsl:if>
		</xsl:attribute>
		<xsl:apply-templates />
	</span>
</xsl:template>

</xsl:stylesheet>
