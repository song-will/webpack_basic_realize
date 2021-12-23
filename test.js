// "use strict"
// var _message = _interopRequireDefault(require("./message.js"))
// function _interopRequireDefault (obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
// console.log('message', _message["default"])

    (function (graph) {
        //require函数的本质是执行一个模块的代码，然后将相应变量挂载到exports对象上
        function require (module) {
            //localRequire的本质是拿到依赖包的exports变量
            function localRequire (relativePath) {
                console.log('localRequire', graph[module].dependencies[relativePath])
                return require(graph[module].dependencies[relativePath]);
            }
            var exports = {};
            (function (require, exports, code) {
                eval(code);
            })(localRequire, exports, graph[module].code);
            console.log('exports', exports)
            //函数返回指向局部变量，形成闭包，exports变量在函数执行后不会被摧毁
            return exports;
        }
        require('./src/log.js')
    })({ "./src/log.js": { "dependencies": { "./message.js": "./src/message.js" }, "code": "\"use strict\";\n\nvar _message = _interopRequireDefault(require(\"./message.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log('message', _message[\"default\"]);" }, "./src/message.js": { "dependencies": { "./word.js": "./src/word.js" }, "code": "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nvar _word = require(\"./word.js\");\n\nvar message = \"say \".concat(_word.word);\nvar _default = message;\nexports[\"default\"] = _default;" }, "./src/word.js": { "dependencies": {}, "code": "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.word = void 0;\nvar word = 'word';\nexports.word = word;" } })