// initialize current tab settings with dummy var

var storageId = "Pages";
var hostnameId = "PagesHostname";

chrome.tabs.onActivated.addListener( function (activeTab)
{		
	chrome.tabs.query( {active: true, currentWindow: true }, function (tab) 
	{ 

		var hostname = (new URL(tab[0].url)).hostname;
		console.log(hostname)
		chrome.storage.sync.get(null, function (Sync)
		{
			console.info(Sync)
			if (Sync[storageId])
			{
				Pages = Sync[storageId];
			}	else {
				Pages = {};
			}

			if (Sync[hostnameId])
			{
				var previousHostname = Sync[hostnameId];
				if (previousHostname != hostname)
				{
					updatePagesPreviousHostname(Pages, previousHostname);
					updatePagesHostname(Pages, hostname);
					savePages(Pages);
					saveHostname(hostname);
				} else {
					console.log("haven't changed domains, don't update anything")
				}
			} else {
				updatePagesHostname(Pages, hostname);
				savePages(Pages)
				saveHostname(hostname);
			}
		});
	});	
});

chrome.storage.onChanged.addListener(function (changes, namespace)
{
	for (key in changes)
	{
		var storageChange = changes[key];
		console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
		console.info(storageChange);
	}
});

function saveHostname (hostname)
{
	var HostnameSave = {};
	HostnameSave[hostnameId] = hostname;
	chrome.storage.sync.set(HostnameSave, function () 
	{
		console.log("successful update")
	})
}
function savePages (Pages)
{
	var Timestamps = {};
	Timestamps[storageId] = Pages;
	chrome.storage.sync.set(Timestamps, function () 
	{
		console.log("successful update")
	})
}


function updatePagesHostname (Pages, hostname)
{
	console.log("updatePagesHostname: " + hostname)
	var date = new Date();
	if ((Object.keys(Pages)).indexOf(hostname) > -1)
	{
		if (Pages[hostname].constructor === Array)
		{
			var obj = { startTime : +date }
			console.info( "object to put in hash is ", +date);
			Pages[hostname].push(obj)
		} else {
			err = "value for keys in Pages should be Arrays"
			throw err
		}
	} else {
		// If no key for that host, make one and add Array
		var obj = { startTime : +date }
		Pages[hostname] = [ obj ] 
	}
}

function updatePagesPreviousHostname (Pages, hostname)
{
	var date = new Date();
	console.log("updatePagesPreviousHostname " + hostname)
	if (Pages[hostname])
	{
		if (Pages[hostname].constructor === Array)
		{
			Pages[hostname][Pages[hostname].length-1]['endTime'] = +date;
		} else {
			err = "value for keys in Pages should be Arrays"
			throw err
		}
	} else {
		// If no key for that host, make one and add Array
		err = "No key for " + hostname + ", prev page didn't get logged."
		throw err
	}
}