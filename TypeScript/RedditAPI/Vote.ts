/// <reference path="../index.ts" />
/**
    Namespace for All AlienTube operations.
    @namespace AlienTube
*/
module AlienTube {
    /**
        Perform a request to Reddit to either save or unsave an item.
        @class RedditVoteRequest
        @param thing The Reddit ID of the item the user wants to vote on
        @param type Whether the user wants to upvote, downvote, or remove their vote.
        @param callback Callback handler for the event when loaded.
    */
    export class RedditVoteRequest {
        constructor (thing : string, type : VoteType, callback? : any) {
            var url = "https://api.reddit.com/api/vote";
            new HttpRequest(url, RequestType.POST, callback, {
                "uh": Main.Preferences.getString("redditUserIdentifierHash"),
                "id": thing,
                "dir": type
            });
        }
    }

    export enum VoteType {
        UPVOTE = 1,
        DOWNVOTE = -1,
        NONE = 0
    }
}
