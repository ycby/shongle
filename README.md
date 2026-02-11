# shongle
Project for personal use, including:
 - tracking some basic market data
 - tracking own portfolio

Currently has:
 - automated retrieval of active stocks from HKEX
   - handles deactivating old stocks even with same ticker
 - automated retrieval of short data from SFC (noted that it's only reportable data)
   - handles finding the correct stock to be parent by ticker + name
     - ensure no mis-parenting because stock uses ticker of an inactive stock
 - rest apis for db objects to support portfolio tracking/data vis
   - customisable validation for each incoming param/body field