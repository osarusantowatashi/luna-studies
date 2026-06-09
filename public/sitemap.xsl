<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:html="http://www.w3.org/TR/REC-html40"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>LUNA Studies XML Sitemap</title>
        <style>
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            color: #111827;
            background: #ffffff;
          }
          .header {
            background: #10172f;
            color: white;
            padding: 32px;
          }
          .header h1 {
            margin: 0 0 16px;
            font-size: 22px;
          }
          .header p {
            margin: 8px 0;
            font-size: 15px;
          }
          .content {
            padding: 28px 32px;
          }
          table {
            width: 100%;
            max-width: 1200px;
            border-collapse: collapse;
            font-size: 15px;
          }
          th {
            text-align: left;
            border-bottom: 2px solid #d1d5db;
            padding: 14px 8px;
          }
          td {
            padding: 14px 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          tr:nth-child(even) {
            background: #f9fafb;
          }
          a {
            color: #2563eb;
            text-decoration: underline;
          }
        </style>
      </head>

      <body>
        <div class="header">
          <h1>XML Sitemap</h1>
          <p>Generated for LUNA Studies. This XML Sitemap is meant to be consumed by search engines like Google or Bing.</p>
          <p>You can find more information about XML Sitemaps at sitemaps.org.</p>
        </div>

        <div class="content">
          <h2>Sitemap URLs</h2>

          <table>
            <tr>
              <th>URL</th>
              <th>Last Modified</th>
            </tr>

            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <tr>
                <td>
                  <a href="{sitemap:loc}">
                    <xsl:value-of select="sitemap:loc"/>
                  </a>
                </td>
                <td>
                  <xsl:value-of select="sitemap:lastmod"/>
                </td>
              </tr>
            </xsl:for-each>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>