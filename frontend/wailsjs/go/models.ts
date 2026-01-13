export namespace main {
	
	export class VocabItem {
	    id: string;
	    word: string;
	    def: string;
	    sentences: string;
	    date_added: string;
	    time: string;
	
	    static createFrom(source: any = {}) {
	        return new VocabItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.word = source["word"];
	        this.def = source["def"];
	        this.sentences = source["sentences"];
	        this.date_added = source["date_added"];
	        this.time = source["time"];
	    }
	}
	export class DailyLog {
	    id: string;
	    date: string;
	    module: string;
	    duration: number;
	    score: number;
	    reflection: string;
	    homework: string;
	    learnings: string;
	    content: string;
	    source_url: string;
	    screenshot: string;
	    time: string;
	
	    static createFrom(source: any = {}) {
	        return new DailyLog(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.date = source["date"];
	        this.module = source["module"];
	        this.duration = source["duration"];
	        this.score = source["score"];
	        this.reflection = source["reflection"];
	        this.homework = source["homework"];
	        this.learnings = source["learnings"];
	        this.content = source["content"];
	        this.source_url = source["source_url"];
	        this.screenshot = source["screenshot"];
	        this.time = source["time"];
	    }
	}
	export class UserProfile {
	    name: string;
	    test_date: string;
	    target_score: number;
	    last_open_date: string;
	    is_setup_complete: boolean;
	    reminder_times: string[];
	    reminder_enabled: boolean;
	    tutorial_seen: boolean;
	
	    static createFrom(source: any = {}) {
	        return new UserProfile(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.test_date = source["test_date"];
	        this.target_score = source["target_score"];
	        this.last_open_date = source["last_open_date"];
	        this.is_setup_complete = source["is_setup_complete"];
	        this.reminder_times = source["reminder_times"];
	        this.reminder_enabled = source["reminder_enabled"];
	        this.tutorial_seen = source["tutorial_seen"];
	    }
	}
	export class AppState {
	    user_profile: UserProfile;
	    daily_logs: DailyLog[];
	    vocabulary: VocabItem[];
	
	    static createFrom(source: any = {}) {
	        return new AppState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.user_profile = this.convertValues(source["user_profile"], UserProfile);
	        this.daily_logs = this.convertValues(source["daily_logs"], DailyLog);
	        this.vocabulary = this.convertValues(source["vocabulary"], VocabItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class UpdateInfo {
	    available: boolean;
	    version: string;
	    body: string;
	    download_url: string;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.available = source["available"];
	        this.version = source["version"];
	        this.body = source["body"];
	        this.download_url = source["download_url"];
	        this.error = source["error"];
	    }
	}
	

}

