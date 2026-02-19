const apiKey = "AIzaSyDHoRRcSNaFiFYgg_7O3ccd7k9_nW98ZtA";
async function run() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.models) {
            console.log(data.models.map(m => m.name).join('\n'));
        } else {
            console.log("No models found or error:", JSON.stringify(data));
        }
    } catch (e) { console.error(e); }
}
run();
