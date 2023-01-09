Code base for Lightning talk "JS Proxy, where have you been all my life?" - Codemash 2023

**Setup Instructions:**
1. If you do not have nodeJS, download and install the latest version.
2. Run the following command on the root folder of this repository: npm install
3. Start the web server using this command: npm run web
4. Launch a web browser and navigate to one of the web server urls listed after the web server is started
    Example of site avaialble upon web server starting
    Available on:
    http://10.0.0.14:8080
    http://127.0.0.1:8080

5. Navigate to one of the pages listed on the default page.  (Default page should list a number of pages each with a different example.)




**TypeScript Compilation**
If you would like to play with the code, follow the instructions below to compile the typescript files once you have made modifications.
If you have already completed the steps above for setup, skip steps 1 and 2.

1. If you do not have nodeJS, download and install the latest version.
2. Run the following command on the root folder of this repository: npm install
3. Modify any or all typescript files in the src/scripts folder.
4. Run the following command: npm run tsc (This will compile the TypeScript files to their respective JS files.)




**JS Caching**
If you have made made changes to the source JS files either directly or via TypeScript compilation, you may need to launch the Dev Tools (F12), and turn off file
caching in the Network tab.


Have fun!