//导入包
const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const babel = require('@babel/core')

/**
 * 生成单个文件的依赖
 * @param {*} filename 
 */
function stepOne (filename) {
    const content = fs.readFileSync(filename, 'utf-8')
    const ast = parser.parse(content, {
        sourceType: 'module'
    })
    const dependencies = {}
    // 遍历抽象语法树
    traverse(ast, {
        ImportDeclaration ({ node }) {
            const dirname = path.dirname(filename)
            const newFile = './' + path.join(dirname, node.source.value)
            dependencies[node.source.value] = newFile
        }
    })
    // 通过@babel/core 和 @babel/preset-env进行代码转换
    const { code } = babel.transformFromAst(ast, null, {
        presets: ["@babel/preset-env"]
    })
    return {
        filename,
        dependencies,
        code
    }
}

/**
 * 测试第一步
 * data {
  filename: './src/log.js',
  dependencies: { './message': './src/message' },
  code: '"use strict";\n' +
    '\n' +
    'var _message = _interopRequireDefault(require("./message"));\n' +
    '\n' +
    'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
    '\n' +
    `console.log('message', _message["default"]);`
}
 */
// const data = stepOne('./src/log.js')
// console.log('data', data)

// 生成依赖图谱
/**
 * 
 * @param {*} entry 入口文件
 */
function stepTwo (entry) {
    const entryModule = stepOne(entry)
    const graphArray = [entryModule]
    for (let i = 0; i < graphArray.length; i++) {
        const item = graphArray[i]
        const { dependencies } = item
        for (let j in dependencies) {
            graphArray.push(
                stepOne(dependencies[j])
            )
        }
    }
    const graph = {}
    graphArray.forEach(item => {
        graph[item.filename] = {
            dependencies: item.dependencies,
            code: item.code
        }
    })
    return graph
}

// console.log(stepTwo('./src/log.js'))
/**
 *  生成代码字符串
 * @param {*} entry 
 */
function stepThree (entry) {
    const graph = JSON.stringify(stepTwo(entry))
    return `
        (function(graph) {
            //require函数的本质是执行一个模块的代码，然后将相应变量挂载到exports对象上
            function require(module) {
                //localRequire的本质是拿到依赖包的exports变量
                function localRequire(relativePath) {
                    return require(graph[module].dependencies[relativePath]);
                }
                var exports = {};
                (function(require, exports, code) {
                    eval(code);
                })(localRequire, exports, graph[module].code);
                return exports;//函数返回指向局部变量，形成闭包，exports变量在函数执行后不会被摧毁
            }
            require('${entry}')
        })(${graph})`
}

const code = stepThree('./src/log.js')
console.log('code', code);