let initial = true;

function factory(type) {
    let sceneClass;
    if (type === "Location") {
        sceneClass = Location;
    } else if (type === "North") {
        sceneClass = North;
    } else if (type === "West") {
        sceneClass = West;
    } else if (type === "East") {
        sceneClass = East;
    } else if (type === "Nook") {
        sceneClass = Nook;
    } else if (type === "Exit") {
        sceneClass = Exit;
    } else if (type === "LeverEvent") {
        sceneClass = LeverEvent;
    } else if (type === "GateEvent") {
        sceneClass = GateEvent;
    } else if (type === "CatEvent") {
        sceneClass = CatEvent;
    } else if (type === "BookGet") {
        sceneClass = BookGet;
    }
    return sceneClass;
}

class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData["Title"]); // TODO: replace this text using this.engine.storyData to find the story title
        this.engine.addChoice("Begin the story");
    }

    handleChoice() {
        let className = this.engine.storyData["InitialScene"];
        this.engine.gotoScene(factory(className), this.engine.storyData["InitialLocation"]); // TODO: replace this text by the initial location of the story
    }
}

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData["Locations"][key]; // TODO: use `key` to get the data object for the current story location
        if (initial && locationData["InitialBody"]) {
            this.engine.show(locationData["InitialBody"]);
            initial = false;
        } else {
            this.engine.show(locationData["Body"]); // TODO: replace this text by the Body of the location data
        }
        if (locationData["Choices"]) { // TODO: check if the location has any Choices
            for (let choice of locationData["Choices"]) { // TODO: loop over the location's Choices
                this.engine.addChoice(choice["Text"], choice); // TODO: use the Text of the choice
                // TODO: add a useful second argument to addChoice so that the current code of handleChoice below works
            }
        } else {
            this.engine.addChoice("The end.")
        }
    }

    handleChoice(choice) {
        if (choice) {
            this.engine.show("&gt; " + choice["Text"]);
            let className = choice["Scene"];
            this.engine.gotoScene(factory(className), choice["Target"]);
        } else {
            this.engine.gotoScene(End);
        }
    }
}

class North extends Location {
    update(key) {
        let locationData = this.engine.storyData["Locations"][key];
        if (locationData["SecretPassage"]) {
            this.engine.show(locationData["Open"]);
            this.engine.addChoice(locationData["Secret"]["Text"], locationData["Secret"]);
        } else
            this.engine.show(locationData["Closed"]);
    }
}

class West extends Location {
    update(key) {
        let locationData = this.engine.storyData["Locations"][key];
        if (!locationData["LeverPulled"]) {
            this.engine.addChoice(locationData["LeverChoice"]["Text"], locationData["LeverChoice"]);
        }
    }
}

class East extends Location {
    update(key) {
        let locationData = this.engine.storyData["Locations"][key];
        if (locationData["GateOpen"]) {
            this.engine.show(locationData["Open"]);
            this.engine.addChoice(locationData["Tunnel"]["Text"], locationData["Tunnel"]);
        } else {
            this.engine.show(locationData["Closed"]);
            if (locationData["HasBook"]) {
                this.engine.addChoice(locationData["Polite"]["Text"], locationData["Polite"]);
            } else {
                this.engine.addChoice(locationData["Rude"]["Text"], locationData["Rude"]);
            }
        }
    }
}

class Nook extends Location {
    update(key) {
        let locationData = this.engine.storyData["Locations"][key];
        if (!this.engine.storyData["Locations"]["East"]["HasBook"]) {
            this.engine.show(locationData["BookLook"]);
            this.engine.addChoice(locationData["BookChoice"]["Text"], locationData["BookChoice"]);
        }
    }
}

class Exit extends Location {
    update(key) {
        let locationData = this.engine.storyData["Locations"][key];
        if (locationData["CatFed"]) {
            this.engine.addChoice(locationData["Leave"]["Text"], locationData["Leave"]);
        } else {
            this.engine.show(locationData["CatHangry"]);
            if (locationData["HasTuna"]) {
                this.engine.addChoice(locationData["FeedCat"]["Text"], locationData["FeedCat"]);
            } else {
                this.engine.addChoice(locationData["PetCat"]["Text"], locationData["PetCat"]);
            }
        }
    }
}

class LeverEvent extends Location {
    update() {
        this.engine.storyData["Locations"]["West"]["LeverPulled"] = true;
        this.engine.storyData["Locations"]["North"]["SecretPassage"] = true;
    }
}

class GateEvent extends Location {
    create(key) {
        let locationData = this.engine.storyData["Locations"][key];
        if (this.engine.storyData["Locations"]["East"]["HasBook"]) {
            this.engine.show(locationData["PoliteBody"]);
            this.engine.storyData["Locations"]["East"]["GateOpen"] = true;
        } else {
            this.engine.show(locationData["RudeBody"]);
        }
        this.engine.addChoice(locationData["GoBack"]["Text"], locationData["GoBack"]);
    }
}

class CatEvent extends Location {
    create(key) {
        let locationData = this.engine.storyData["Locations"][key];
        if (this.engine.storyData["Locations"]["Exit"]["HasTuna"]) {
            this.engine.show(locationData["CatGood"]);
            this.engine.storyData["Locations"]["Exit"]["CatFed"] = true;
        } else {
            this.engine.show(locationData["CatBad"]);
        }
        this.engine.addChoice(locationData["GoBack"]["Text"], locationData["GoBack"]);
    }
}

class BookGet extends Nook {
    create(key) {
        let locationData = this.engine.storyData["Locations"][key];
        this.engine.show(locationData["BookGet"]);
        this.engine.show(locationData["Body"]);
        this.engine.addChoice(locationData["Choices"][0]["Text"], locationData["Choices"][0]);
    }

    update() {
        this.engine.storyData["Locations"]["East"]["HasBook"] = true;
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');