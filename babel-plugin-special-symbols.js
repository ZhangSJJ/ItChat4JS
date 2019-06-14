/**
 * (1)plugin中@babel/plugin-transform-modules-commonjs（"strictMode": false）是使babel编译完成之后不自动加上strict mode
 * (2)Program：是即使你加上了strict mode 也会帮你干掉
 * (1)的优先级大于(2)
 */

exports["default"] = function () {
    return {
        visitor: {
            Program: {
                exit: function exit(path) {
                    var list = path.node.directives;
                    for (var i = list.length - 1, it; i >= 0; i--) {
                        it = list[i];
                        if (it.value.value === 'use strict') {
                            list.splice(i, 1);
                        }
                    }
                }
            },
            StringLiteral: (path, state) => {
                if (path && path.node) {
                    path.node.value && (path.node.value = path.node.value.replace(/\$__\$/g, '\\'));
                    if (path.node.extra) {
                        path.node.extra.rawValue && ( path.node.extra.rawValue = path.node.extra.rawValue.replace(/\$__\$/g, '\\'));
                        path.node.extra.raw && ( path.node.extra.raw = path.node.extra.raw.replace(/\$__\$/g, '\\'));
                    }

                }
            },
        }
    };
};

module.exports = exports["default"];