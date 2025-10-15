import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: "development",
    entry: "./src/main.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        clean: true,
    },
    devtool: "inline-source-map",
    devServer: {
        static: {
            directory: path.resolve(__dirname),
        },
        port: 8080,
        open: true,
        hot: true,
        watchFiles: ["src/**/*", "index.html"],
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./index.html",
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "src/sw.js", to: "" }, // 👈 salin sw.js ke root dist
            ],
        }),
    ],
};
