/// <reference path="../index.ts" />
/**
    Namespace for All AlienTube operations.
    @namespace AlienTube
*/
module AlienTube {
    /**
        Perform a request to Reddit to either save or unsave an item.
        @class RedditSaveRequest
        @param thing The Reddit ID of the item to either save or unsave
        @param type Whether to save or unsave
        @param callback Callback handler for the event when loaded.
    */
    export class RedditSaveRequest {
        constructor (thing : string, type : SaveType, callback : any) {
            var url = "https://api.reddit.com/api/" + SaveType[type].toLowerCase();
            new HttpRequest(url, RequestType.POST, callback, {
                "uh": Main.Preferences.getString("redditUserIdentifierHash"),
                "id": thing
            });
        }
    }

    export enum SaveType {
        SAVE,
        UNSAVE
    }
}
