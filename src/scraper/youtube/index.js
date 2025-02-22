const { detectSystemInfo, generateRandomName, getYouTubeID, ensureExecutable, handleFile, getVideoUrl, updateFile } = require('./../dist/utils.js');
const { Innertube, UniversalCache } = require("youtubei.js");
const { execFile, exec } = require("child_process");
const ai = require('./ia/index.js');
const path = require("path");
const fs = require("fs");
const os = require("os");
const fetch = require('node-fetch');
const { ytmp3: ytmp3DL, ytmp4: ytmp4DL } = require('@vreden/youtube_scraper')

updateFile()

const tempPath = path.join(__dirname, "../temp")
const tempDirSystem = path.join(tempPath, '/system')
fs.mkdirSync(tempDirSystem, { recursive: true })
let HiudyyDLPath = ''

async function clearSystemTempDir() {
    try {
        const command = "rm -rf " + tempDirSystem + "/*"
        exec(command, (err) => {
            if (err) {
                console.error('Erro ao limpar diretório temporário:', err.message)
            } else {
            }
        })
    } catch (err) {
        console.error('Erro geral:', err.message)
    }
}

function loadAndShuffleCookies() {
    const cookiesPath = path.join(__dirname, "../dist/cookies.json");
    const cookiesArray = JSON.parse(fs.readFileSync(cookiesPath, 'utf8'));
    return cookiesArray.sort(() => Math.random() - 0.5);
};

async function findValidCookie() {
    const cookiesArray = loadAndShuffleCookies();
    const testedCookies = new Set();
    for (const cookie of cookiesArray) {
        if (testedCookies.has(cookie)) continue;
        const tempCookiePath = path.join(__dirname, '../dist/cookie.txt');
        fs.writeFileSync(tempCookiePath, cookie);
        const isValid = await testCookie(tempCookiePath);
        testedCookies.add(cookie);
        if (isValid) {
            return tempCookiePath;
        }
    }
    throw new Error('❌ [ERRO] Nenhum cookie válido foi encontrado.');
};

async function testCookie(cookiePath) {
    const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const args = ["--no-cache-dir", "-F", "--cookies", cookiePath, url];
    return new Promise((resolve, reject) => {
        execFile(HiudyyDLPath, args, (error, stdout, stderr) => {
            if (error) {
                if (HiudyyDLPath.includes('hiudyydl_py')) {
                    execFile('python', [HiudyyDLPath, ...args], (pyErr, pyStdout, pyStderr) => {
                        if (pyErr) {
                            if (pyStderr.includes('This content isn') || (pyErr.message && pyErr.message.includes('This content isn'))) {
                                resolve(false);
                            } else {
                                resolve(true);
                            }
                        } else {
                            resolve(true);
                        }
                    });
                } else if (stderr.includes('This content isn') || (error.message && error.message.includes('This content isn'))) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            } else {
                resolve(true);
            }
        });
    });
}

detectSystemInfo((error, architecture, platform) => {
    if (error) return console.error(`❌ [ERRO] Ao detectar o sistema: ${error.message}`);
    if (platform === 'android') {
        HiudyyDLPath = path.join(__dirname, "../bin/hiudyydl_py");
        console.log(`📱 [PLATAFORMA] Sistema Android detectado.`);
        console.log(`🚀 [@hiudyy/ytdl] Módulo inicializado com Python para Android.`);
        return;
    }
    if (platform !== 'linux' && platform !== 'win32') {
        return console.error(`❌ [PLATAFORMA] Este módulo é compatível apenas com sistemas Linux, Android e Windows.`);
    }
    console.log(`✅ [PLATAFORMA] Sistema detectado: ${platform}.`);

    switch (architecture) {
        case 'x64':
            HiudyyDLPath = path.join(__dirname, platform === 'win32' ? "../bin/hiudyydl_win_x64.zip" : "../bin/hiudyydl");
            console.log(`💻 [ARQUITETURA] Arquitetura x64 detectada.`);
            break;
        case 'arm':
            HiudyyDLPath = path.join(__dirname, "../bin/hiudyydl_v7");
            console.log(`🤖 [ARQUITETURA] Arquitetura ARM detectada.`);
            break;
        case 'arm64':
            HiudyyDLPath = path.join(__dirname, "../bin/hiudyydl_64");
            console.log(`🔧 [ARQUITETURA] Arquitetura ARM64 detectada.`);
            break;
        case 'x86':
            HiudyyDLPath = path.join(__dirname, "../bin/hiudyydl_win_x86.zip");
            console.log(`💻 [ARQUITETURA] Arquitetura x86 detectada.`);
            break;
        default:
            console.error(`❌ [ARQUITETURA] Arquitetura não suportada: ${architecture}`);
            return;
    }

    console.log(`✅ [@hiudyy/ytdl] Módulo inicializado com sucesso na arquitetura: ${architecture}.`);
})

async function processOutput(args, tempFile, retries = 3) {
    await ensureExecutable(HiudyyDLPath);

    const tryExecution = (attempt) =>
        new Promise((resolve, reject) => {
            execFile(HiudyyDLPath, args, async (err, stdout, stderr) => {
                if (err) {
                    if (HiudyyDLPath.includes('hiudyydl_py')) {
                        execFile('python', [HiudyyDLPath, ...args], async (pyErr, pyStdout, pyStderr) => {
                            if (pyErr) {
                                await clearSystemTempDir();
                                reject(`Erro ao executar com Python após ${retries} tentativas: ${pyStderr || pyErr.message}`);
                            } else {
                                handleFile(tempFile, resolve, reject);
                            }
                        });
                    } else {
                        await clearSystemTempDir();
                        reject(`Hiudyydl error após ${retries} tentativas: ${stderr || err.message}`);
                    }
                } else {
                    handleFile(tempFile, resolve, reject);
                }
            });
        });

    return tryExecution(1)
}

async function ytmp3(input) {
    const url = getVideoUrl(input);

    try {
        const ytmp3DLResponse = await ytmp3DL(url);
        if (ytmp3DLResponse?.status && ytmp3DLResponse?.download?.url) {
            const downloadUrl = ytmp3DLResponse.download.url;
            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error("Erro ao fazer o download do arquivo.");
            const buffer = await response.buffer();
            return buffer;
        }
    } catch (error) {
        console.error("Erro na função ytmp3DL:", error);
    }


    const output = path.join(tempPath, generateRandomName("m4a"));
    const validCookiePath = await findValidCookie();

    const args = ["--no-cache-dir", "-f", "worstaudio", "--no-cache-dir", "--no-part", "--cookies", validCookiePath, "-o", output, url];
    return await processOutput(args, output);
}

async function ytmp4(input) {
    const url = getVideoUrl(input);

    try {
        const ytmp4DLResponse = await ytmp4DL(url);
        if (ytmp4DLResponse?.status && ytmp4DLResponse?.download?.url) {
            const downloadUrl = ytmp4DLResponse.download.url;
            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error("Erro ao fazer o download do arquivo.");
            const buffer = await response.buffer();
            return buffer;
        }
    } catch (error) {
        console.error("Erro na função ytmp4DL:", error);
    }

    const output = path.join(tempPath, generateRandomName("mp4"));
    const validCookiePath = await findValidCookie();

    const args = [
        "--no-cache-dir",
        "-f",
        "bestvideo+worstaudio[ext=mp4]/mp4",
        "--no-cache-dir",
        "--no-part",
        "--cookies",
        validCookiePath,
        "-o",
        output,
        url
    ];

    return await processOutput(args, output);
}

module.exports = {
    ytmp3,
    ytmp4,
    ytadl: ytmp3,
    ytvdl: ytmp4,
    alldl,
    yts,
    ai: ai,
    update: updateFile,
    clear: clearSystemTempDir
};