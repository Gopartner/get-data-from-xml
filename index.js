const fs = require('fs');
const https = require('https');
const readline = require('readline');
const { parseString } = require('xml2js');
const colors = require('colors'); // Tambahkan modul colors untuk animasi teks berjalan

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Masukkan URL endpoint: ', (url) => {
    rl.question('Masukkan nama berkas JSON: ', (fileName) => {
        const outputFolder = 'data/';
        const outputFile = outputFolder + fileName + '.json';

        const animateText = (text, interval) => {
            let i = 0;
            const animation = setInterval(() => {
                process.stdout.write(text[i].yellow);
                i++;
                if (i === text.length) {
                    clearInterval(animation);
                    console.log(); // Baris baru setelah animasi selesai
                }
            }, interval);
        };

        const showAnimation = () => {
            console.log('\nSedang proses... silahkan ngopi dulu'.green);
            animateText('.'.repeat(10) + ' ', 100);
        };

        const fetchData = (url, outputFile) => {
            https.get(url, (response) => {
                let data = '';
                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    parseString(data, (err, result) => {
                        if (err) {
                            console.error('Error parsing XML:', err);
                            return;
                        }
                        const jsonData = JSON.stringify(result);
                        fs.writeFile(outputFile, jsonData, 'utf8', (err) => {
                            if (err) {
                                console.error('Error writing to file:', err);
                                return;
                            }
                            console.log('\nData berhasil disimpan dalam berkas:', outputFile);
                            // Tampilkan data JSON di terminal dengan jq
                            console.log('\nData JSON:');
                            const { exec } = require('child_process');
                            exec(`cat ${outputFile} | jq .`, (error, stdout, stderr) => {
                                if (error) {
                                    console.error(`Error executing jq: ${error.message}`);
                                    return;
                                }
                                if (stderr) {
                                    console.error(`Error executing jq: ${stderr}`);
                                    return;
                                }
                                console.log(stdout);
                            });
                        });
                    });
                });
            }).on('error', (error) => {
                console.error('Error fetching data:', error);
            });
        };

        showAnimation();
        fetchData(url, outputFile);

        rl.close();
    });
});

