#Execute the following command to build.

./script/make_static

#Testing can done directly on the /src directory url
(Example: http://localhost/boss64/src/index.html)


#Workers
Workers are bundled in a second bundle.  Since the complexities of ImportScript,
all worker code, for each worker is pre-concatenated into a single file, using "workerbundle.json"

#Debugging Workers
All code of a worker will refer to the same file, and the source map will point to this file.
To make it easier, comments are inserted to show which file the section of the concatenated worker source
origins to.
