window.updateGameTime = function(time) {
    if (window.gameComponent) {
        window.gameComponent.invokeMethodAsync('UpdateGameTime', time);
    }
};

window.DotNet = {
    attachReviver: function(instance) {
        window.gameComponent = instance;
    }
}; 