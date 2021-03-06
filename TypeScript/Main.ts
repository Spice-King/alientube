/// <reference path="index.ts" />
/**
Namespace for All AlienTube operations.
@namespace AlienTube
*/
module AlienTube {
    /**
        Main class for AlienTube
        @class Main
    */
    export class Main {
        static Preferences : BrowserPreferenceManager;
        static localisationManager : LocalisationManager;
        static commentSection : CommentSection;
        currentVideoIdentifier : string;

        constructor () {
            // Load stylesheet from disk.
            Main.Preferences = new BrowserPreferenceManager();
            Main.localisationManager = new LocalisationManager(() => {
                if (window.getCurrentBrowser() == Browser.SAFARI) {
                    var stylesheet = document.createElement("link");
                    stylesheet.setAttribute("href", Main.getExtensionRessourcePath("style.css"));
                    stylesheet.setAttribute("type", "text/css");
                    stylesheet.setAttribute("rel", "stylesheet");
                    document.head.appendChild(stylesheet);
                }

                // Start observer to detect when a new video is loaded.
                var observer = new MutationObserver(this.mutationObserver);
                var config = { attributes : true, childList : true, characterData : true };
                observer.observe(document.getElementById("content"), config);

                // Start a new comment section.
                this.currentVideoIdentifier = Main.getCurrentVideoId();
                if (window.isYouTubeVideoPage) {
                    Main.commentSection = new CommentSection(this.currentVideoIdentifier);
                }
            });

        }

        /**
            Mutation Observer for monitoring for whenver the user changes to a new "page"
        */
        private mutationObserver (mutations : Array<MutationRecord>) {
            mutations.forEach(function(mutation) {
                var target = <HTMLElement>mutation.target;
                if (target.classList.contains("yt-card") || target.id === "content") {
                    var reportedVideoId = Main.getCurrentVideoId();
                    if (reportedVideoId !== this.currentVideoIdentifier) {
                        this.currentVideoIdentifier = reportedVideoId;
                        if (window.isYouTubeVideoPage) {
                            Main.commentSection = new CommentSection(this.currentVideoIdentifier);
                        }
                    }
                }
            });
        }

        /**
        * Get the current YouTube video identifier of the window.
        * @returns YouTube video identifier.
        */
        static getCurrentVideoId() : string {
            if (window.location.search.length > 0) {
                var s = window.location.search.substring(1);
                var requestObjects = s.split('&');
                for (var i = 0, len = requestObjects.length; i < len; i++) {
                    var obj = requestObjects[i].split('=');
                    if (obj[0] === "v") {
                        return obj[1];
                    }
                }
            }
            return null;
        }

        /**
        * Get a Reddit-style "x time ago" Timestamp from a unix epoch time.
        * @param epochTime Epoch timestamp to calculate from.
        * @returns A string with a human readable time.
        */
        static getHumanReadableTimestamp (epochTime : number) : string {
            var secs = Math.floor(((new Date()).getTime() / 1000) - epochTime);
            secs = Math.abs(secs);

            var timeUnits = {
                Year:   Math.floor(secs / 60 / 60 / 24 / 365.27),
                Month:  Math.floor(secs / 60 / 60 / 24 / 30),
                Day:    Math.floor(secs / 60 / 60 / 24),
                Hour:   Math.floor(secs / 60 / 60),
                Minute: Math.floor(secs / 60),
                Second: secs,
            };

            /* Retrieve the most relevant number by retrieving the first one that is "1" or more.
            Decide if it is plural and retrieve the correct localisation */
            for (var timeUnit in timeUnits) {
                if (timeUnits.hasOwnProperty(timeUnit) && timeUnits[timeUnit] >= 1) {
                    if (timeUnits[timeUnit] > 1) {
                        return Main.localisationManager.get("timestamp_format", [
                            timeUnits[timeUnit],
                            Main.localisationManager.get("timestamp_format_" + timeUnit.toLowerCase() + "_plural")
                        ]);
                    } else {
                        return Main.localisationManager.get("timestamp_format", [
                            timeUnits[timeUnit],
                            Main.localisationManager.get("timestamp_format_" + timeUnit.toLowerCase())
                        ]);
                    }
                }
            }
            return Main.localisationManager.get("timestamp_format", [
                "0",
                Main.localisationManager.get("timestamp_format_second_plural")
            ]);
        }

        /**
        * Get the path to a ressource in the AlienTube folder.
        * @param path Filename to the ressource.
        * @returns Ressource path (file://)
        */
        static getExtensionRessourcePath (path : string) : string {
            switch (window.getCurrentBrowser()) {
                case Browser.SAFARI:
                    return safari.extension.baseURI + 'res/' + path;
                case Browser.CHROME:
                    return chrome.extension.getURL('res/' + path);
                case Browser.FIREFOX:
                    return self.options.ressources[path];
                default:
                    return null;
            }
        }

        /**
            Get the HTML templates for the extension
        */
        static getExtensionTemplates (callback : any) {
            switch(window.getCurrentBrowser()) {
                case Browser.FIREFOX:
                    var templateHTML = self.options.template;
                    var template = document.createElement("div");
                    var handlebarHTML = Handlebars.compile(templateHTML);
                    template.innerHTML = handlebarHTML();

                    if (callback) {
                        callback(template);
                    }
                    break;

                case Browser.SAFARI:
                    new HttpRequest(Main.getExtensionRessourcePath("templates.html"), RequestType.GET, (data) => {
                        var template = document.createElement("div");
                        template.innerHTML = data;
                        document.head.appendChild(template);
                        if (callback) {
                            callback(template);
                        }
                    }, null, null);
                    break;

                case Browser.CHROME:
                    var templateLink = document.createElement("link");
                    templateLink.id = "alientubeTemplate";
                    templateLink.onload = () => {
                        if (callback) {
                            callback(templateLink.import);
                        }
                    }
                    templateLink.setAttribute("rel", "import");
                    templateLink.setAttribute("href", Main.getExtensionRessourcePath("templates.html"));
                    document.head.appendChild(templateLink);
                    break;
            }
        }

        static getExtensionTemplateItem (templateCollection : any, id : string) {
            if (window.getCurrentBrowser() === Browser.CHROME) {
                return templateCollection.getElementById(id).content.cloneNode(true);
            } else {
                return templateCollection.querySelector("#" + id).content.cloneNode(true);
            }
        }
    }
}
