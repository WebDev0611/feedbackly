const webpack = require("webpack");
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const autoprefixer = require('autoprefixer');

const extractStyles = new ExtractTextPlugin('registration.min.css');

module.exports = (env, devBuild) => {
    var config = {
        entry: [path.resolve('client/registration.js')],
        output: { filename: 'registration.min.js', path: path.resolve('dist/') },
        module: {
            rules: [
                  {
                      test: /\.js$/,
                      exclude: /node_modules/,
                      loader: 'babel-loader',
                      options: {
                          presets: [
                              ['es2015', { modules: false }], 'stage-0'
                          ]
                      }
                  },
                {
                    test: /\.(sass|scss)$/,
                    enforce: "pre",
                    use: "import-glob-loader"
                },
                {
                    test: /\.(sass|scss)$/,
                    use: extractStyles.extract({
                        use: [

                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: devBuild,
                                minimize: !devBuild,
                                discardComments: {
                                    removeAll: !devBuild
                                }
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: () => [autoprefixer]
                            }
                        },
                        { loader: 'resolve-url-loader'},
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true
                            }
                        },
                        ]})
                },

                {         test: /\.(jpe?g|png|gif|svg)$/i, use: 'ignore-loader' }
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(devBuild ? 'development' : 'production'),
                'process.env.DASH_URL': JSON.stringify(env.DASH_URL),

            }),
            extractStyles
        ],
        resolve: {
            modules: ['node_modules']
        },
        watch: devBuild,
        cache: devBuild,
        devtool: devBuild ? 'eval-source-map' : '',
    };
    if (!devBuild) config.plugins.push(new webpack.optimize.UglifyJsPlugin());
    return config;

}
