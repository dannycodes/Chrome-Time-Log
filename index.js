// initialize current tab settings with dummy var

var storageId = "Pages";
var hostnameId = "PagesHostname";

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ? "from a content script: " + sender.tab.url : "from the extension.");
    if (request.intent === "store_time")
    {
    	savePages(request.url, request.start_time, request.ellapsed_time, request.off_page_time);
    	sendResponse({success: "success!"});

    } else if (request.intent === "notification") {
    	chrome.notifications.create('overTime',
    	{
    		type : request.TemplateType,
    		iconUrl : request.iconUrl,
    		title : request.title,
    		message: request.message
    	},
    	function (notificationId) { console.log("notify")} );
    	sendResponse({success: "success!"});

    } else if (request.intent === "get_time") {
  		chrome.storage.sync.get(storageId, function (p)
			{
				var hostname = request.url
				var total_day = 0;
				if (p.Pages[hostname])
				{
					console.info(p.Pages[hostname]);
					timeObjs = p.Pages[hostname];
					// iterate over each time page open / close
					timeObjs.forEach(function (timeObj)
					{
						var beginToday = new Date();
						beginToday.setHours(0,0,0,0);
						if (timeObj.start_time > +beginToday)
						{
							var ellapsed_time = timeObj.ellapsed_time;
							total_day += ellapsed_time;
						}
					});	
				} 
			});
    }
  }
);

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
	console.info("last error: ", chrome.runtime.lastError);
});

function savePages (url, start_time, ellapsed_time, off_page_time)
{
	var hostname = (new URL(url)).hostname;
	// create the object to pass into each key of  Pages obj.
	var to_insert = { start_time: start_time, ellapsed_time: ellapsed_time, off_page_time: off_page_time };
	var Pages = chrome.storage.sync.get(storageId, function (p)
	{
		if (p.Pages)
		{
			setTimeData(p.Pages, hostname, to_insert);	
		} else {
			var PageTimeLog = {};
			PageTimeLog[storageId] = {};
			chrome.storage.sync.set(PageTimeLog, function () 
				{ 
					console.log("successfully instantiate object in sync db.");
					var Pages = chrome.storage.sync.get(storageId, function (p) 
					{
						console.info(p);
						if (!p.Pages) { throw "Pages should have JUST been instantiated" };
						setTimeData(p.Pages, hostname, to_insert);
					});
				});
		}
	})
}

// Take in the obj (in sync db), keyname, and value to be pushed into arr
function setTimeData (Pages, hostname, hostname_arr_var)
{
	if ((Object.keys(Pages)).indexOf(hostname) > -1)
	{
		// check to make sure the value of key hostname is an arr
		if (Pages[hostname].constructor === Array)
		{
			// push the new values into hostname
			Pages[hostname].push(hostname_arr_var)
			insertIntoSync(Pages)
		} else {
			err = "hostname key should have val of type arr"
			throw err
		}
	} else {
		console.log("New hostname. Add key " + hostname + " with Array value w/ one entry, " + hostname_arr_var);
		Pages[hostname] = [hostname_arr_var];
		insertIntoSync(Pages);
	}
}

function insertIntoSync(Pages)
{
	var PageTimeLog = {};
	PageTimeLog[storageId] = Pages;
	chrome.storage.sync.set(PageTimeLog, function () 
	{
		console.log('success');
	});
}


