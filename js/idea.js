(function() {
  var _idea = {
    init: function() {
      _idea.sidebar.initSidebar();
      _idea.sceneObject.initSceneObjects();
      _idea.zoom.initZoomControllers();
    },
    sidebar: {
      initSidebar: function() {
        [].forEach.call(document.getElementsByClassName("layout-sidebar"), function(value, index) {
          var stickers = value.getElementsByClassName("sticker");
          [].forEach.call(stickers, function(sticker) {
            sticker.addEventListener("click", function(evt) {
              _idea.sidebar.toggleSidebar(value, evt);
            }, false);
          });
        });
      },
      toggleSidebar: function(sidebar, evt) {
        if(!sidebar.classList.contains("sidebar-opened") && !sidebar.classList.contains("sidebar-closed")) {
          sidebar.classList.add("sidebar-opened");
        }
        else if(sidebar.classList.contains("sidebar-opened")) {
          sidebar.classList.remove("sidebar-opened");
          sidebar.classList.add("sidebar-closed");
        }
        else if(sidebar.classList.contains("sidebar-closed")){
          sidebar.classList.remove("sidebar-closed");
        }
      }
    },
    zoom: {
      initZoomControllers: function() {
        _idea.zoom.zoomControllers = {};

        var containers = document.getElementsByClassName("zoomControllersContainer");
        [].forEach.call(containers, function(value, index) {
          var controllers = value.getElementsByClassName("zoomController");

          for(var i = 0; i < controllers.length; i++) {
            controllers[i].addEventListener("click", function(evt) {
              evt.preventDefault();
              _idea.zoom.zoomTarget(evt.target, evt);
            }, false);

            _idea.zoom.zoomControllers[controllers[i].getAttribute("data-zoomTarget")] = {
              container: value,
              controller: controllers[i]
            }
          }
        });
      },
      zoomTarget: function(source, event) {
        var targetId = source.getAttribute("data-zoomTarget");
        if(targetId == null || targetId == "") {
          console.log("Element does't have target");
          return;
        }

        var target = document.getElementById(targetId);
        if(target == null) {
          console.log("Can't find target id #" + targetId);
          return;
        }
        else if(target.classList.contains("scene")) {
          _idea.zoom.toggleActive(target, target);
          _idea.zoom.toggleActive(_idea.zoom.zoomControllers[targetId].container, source.parentElement);

          target.classList.remove("zoomed");
          target.classList.remove("zooming");
          target.style.transform = "";
          return;
        }

        var scene = target.parentElement;
        if(scene == null || !scene.classList.contains("scene")) {
          console.log("scene does't exist");
          return;
        }

        if(!source.classList.contains("active")) {
          _idea.zoom.toggleActive(_idea.zoom.zoomControllers[targetId].container, source.parentElement);

          _idea.zoom.smoothSwitch(scene, target, targetId);
        }
      },
      zoomTo: function(scene, target, cords) {
        var transformStyle = 'scale(' + (cords.scale) + ',' + (cords.scale) + ') \
                            rotateZ(' + (-1 * cords.rotate) + 'deg) \
                            translateX(' + (-1 * _idea.helpers.toPercents(cords.x)) + '%) \
                            translateY(' + (-1 * _idea.helpers.toPercents(cords.y)) + '%) \
                            translateZ(' + (-1 * cords.z) + 'px)';

        scene.style.transform = transformStyle;

        _idea.zoom.toggleActive(scene, target);
      },
      animation: {
        setNextStep: function(step) {
          _idea.zoom.animation.scene.removeEventListener("transitionend", _idea.zoom.animation.nextStep);
          _idea.zoom.animation.nextStep = step;
          _idea.zoom.animation.scene.addEventListener("transitionend", _idea.zoom.animation.nextStep);
        },
        zoomOut: function() {
          _idea.zoom.animation.setNextStep(_idea.zoom.animation.zoomIn);

          var zoomOutStyle = 'rotateZ(' + (-1 * _idea.zoom.animation.cords.rotate) + 'deg) \
                            translateX(' + (-(_idea.helpers.toPercents(_idea.zoom.animation.cords.x))) + '%) \
                            translateY(' + (-(_idea.helpers.toPercents(_idea.zoom.animation.cords.y))) + '%) \
                            translateZ(' + (-(_idea.zoom.animation.cords.z * 1.5)) +'px)';

          _idea.zoom.animation.scene.classList.remove("zoomed");
          _idea.zoom.animation.scene.classList.add("zooming");
          _idea.zoom.animation.scene.style.transform = zoomOutStyle;
        },
        zoomIn: function() {
          _idea.zoom.animation.setNextStep(_idea.zoom.animation.zoomCompleted);

          _idea.zoom.animation.scene.classList.add("zooming");
          _idea.zoom.zoomTo(_idea.zoom.animation.scene, _idea.zoom.animation.target, _idea.zoom.animation.cords);
        },
        zoomCompleted: function() {
          _idea.zoom.animation.setNextStep(function() {});

          _idea.zoom.animation.scene.classList.remove("zooming");
          _idea.zoom.animation.scene.classList.add("zoomed");
        }
      },
      smoothSwitch: function(scene, target, targetId) {

        _idea.zoom.animation.scene = scene;
        _idea.zoom.animation.target = target;
        _idea.zoom.animation.cords = _idea.sceneObject.sceneObjects[targetId];

        if(scene.classList.contains("zoomed") || scene.classList.contains("zooming")) {
          _idea.zoom.animation.zoomOut();
        }
        else if(!scene.classList.contains("zooming")){
          _idea.zoom.animation.zoomIn();
        }
      },
      toggleActive: function(container, target) {
        var elements = container.getElementsByClassName("active");
        if(elements) {
          [].forEach.call(elements, function(value, index) {
            value.classList.remove("active");
          });
        }
        target.classList.add("active");
      }
    },
    sceneObject: {
      initSceneObjects: function() {
        var sceneObjects = document.getElementsByClassName("sceneObject");

        _idea.sceneObject.sceneObjects = {};

        [].forEach.call(sceneObjects, function(value, index) {

          var obj = {
            x: value.getAttribute("data-x") | 0,
            y: value.getAttribute("data-y") | 0,
            z: value.getAttribute("data-z") | 0,
            rotate: value.getAttribute("data-rotate") | 0,
            scale: value.getAttribute("data-scale") | 1
          };

          _idea.sceneObject.transformTo(value, obj)

          var id = value.getAttribute("id");
          if(id)
          _idea.sceneObject.sceneObjects[id] = obj;
        });
      },
      transformTo: function(obj, cords) {
        var transformStyle = 'translate3D(' + _idea.helpers.toPercents(cords.x) + '%, ' + _idea.helpers.toPercents(cords.y) + '%, ' + (cords.z) + 'px) \
        rotateZ(' + (cords.rotate) + 'deg) \
        scale(' + (cords.scale) + ',' + (cords.scale) + ')';

        obj.style.transform = transformStyle;
      }
    },
    helpers: {
      toPercents: function(t) {
        return t * 100;
      }
    }
  }

  window.onload = function() {
    _idea.init();
  };
})()
