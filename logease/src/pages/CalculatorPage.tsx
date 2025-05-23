import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export function CalculatorPage() {
    // Default values from the image
    const [inputs, setInputs] = useState({
        dailyLogSize: '20',
        numberOfMachines: '3',
        hotDataRetention: '30',
        backupCount: '2',
        compressionRatio: '1.4',
        diskRedundancy: '1.2',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        setInputs({ ...inputs, [key]: e.target.value });
    };

    const resourceReference = [{
        "10g-20g-single": "https://logease.s3.ap-southeast-2.amazonaws.com/machine-requirement/10G-20G-single.png",
        "10g-20g-cluster": "https://logease.s3.ap-southeast-2.amazonaws.com/machine-requirement/10G-20G-cluster.png",
        "100g-cluster": "https://logease.s3.ap-southeast-2.amazonaws.com/machine-requirement/100G-cluster.png",
        "300g-cluster": "https://logease.s3.ap-southeast-2.amazonaws.com/machine-requirement/300G-cluster.png",
        "1t-cluster": "https://logease.s3.ap-southeast-2.amazonaws.com/machine-requirement/1T-cluster.png",
        "10t-cluster": "https://logease.s3.ap-southeast-2.amazonaws.com/machine-requirement/10T-cluster.png"
    }];

    const [currentResourceReference, setCurrentResourceReference] = useState<{ url: string; name: string }[]>(findClosestResourceReference(parseFloat(inputs.dailyLogSize), parseFloat(inputs.hotDataRetention), parseFloat(inputs.numberOfMachines)));
    useEffect(() => {
        setCurrentResourceReference(findClosestResourceReference(parseFloat(inputs.dailyLogSize), parseFloat(inputs.hotDataRetention), parseFloat(inputs.numberOfMachines)));
    }, [inputs.dailyLogSize, inputs.hotDataRetention, inputs.numberOfMachines]);

    function findClosestResourceReference(dailyLogSize: number, hotDataRetention: number, numberOfMachines: number): { url: string; name: string, is_cluster: boolean }[] {
        if (isNaN(dailyLogSize) || isNaN(hotDataRetention) || isNaN(numberOfMachines)) {
            return [];
        }


        const _totalStorage = dailyLogSize * hotDataRetention;
        const sizePerMachine = _totalStorage / numberOfMachines;
        if (hotDataRetention === 0 || numberOfMachines < 1) {
            return [];
        }
        let allMachines: { url: string; name: string, is_cluster: boolean }[] = [];
        if (_totalStorage <= 1500) {
            allMachines.push({ url: resourceReference[0]["10g-20g-single"], name: "10g-20g-single", is_cluster: false });
        }
        if (_totalStorage <= 2500) {
            allMachines.push({ url: resourceReference[0]["10g-20g-cluster"], name: "10g-20g-cluster", is_cluster: true });
        }

        if (_totalStorage <= 10000) {
            allMachines.push({ url: resourceReference[0]["100g-cluster"], name: "100g-cluster", is_cluster: true });
        }
        
        if (_totalStorage <= 30000) {
            allMachines.push({ url: resourceReference[0]["300g-cluster"], name: "300g-cluster", is_cluster: true });
        }

        if (_totalStorage <= 48000) {
            allMachines.push({ url: resourceReference[0]["1t-cluster"], name: "1t-cluster", is_cluster: true }); 
        }

        if (_totalStorage <= 288000) {
            allMachines.push({ url: resourceReference[0]["10t-cluster"], name: "10t-cluster", is_cluster: true });
        }

        for(let i = 0; i < allMachines.length; i++) {
            let currentMachine = allMachines[i];
            if (numberOfMachines === 1 && currentMachine.is_cluster){
                currentMachine.name += " (Not Standalone)";
            }
            if (numberOfMachines > 1 && !currentMachine.is_cluster){
                currentMachine.name += " (Not Cluster)";
            }
        }

        return allMachines;
    }

    const totalStorage =
    parseFloat(inputs.dailyLogSize) *
    parseFloat(inputs.backupCount) *
    parseFloat(inputs.compressionRatio) *
    parseFloat(inputs.diskRedundancy) *
    parseFloat(inputs.hotDataRetention);

    const totalStoragePerMachine = totalStorage / parseFloat(inputs.numberOfMachines);
    
    // Calculate disk usage percentage
    const diskUsagePercent = Math.max(0, Math.round((2.0 - parseFloat(inputs.diskRedundancy || '0')) * 100));

    // Cold data calculations
    const totalColdStorage = parseFloat(inputs.dailyLogSize) * parseFloat(inputs.hotDataRetention);
    const totalColdStorageTB = totalColdStorage / 1000;
    const coldStoragePerMachineTB = totalColdStorageTB / parseFloat(inputs.numberOfMachines);

    return (
        <div className="main-container font-serif text-white">

            <Link to="/" className="logease-button">
                Back
            </Link>

            <div className="bg-[#232026] rounded-lg shadow-lg p-8 w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-6 text-center">Machine Requirement Calculator</h2>
                <table className="w-full text-lg">
                    <tbody>
                        <tr className="border-b border-gray-700">
                            <td className="py-3 pr-4 font-semibold">Daily log size</td>
                            <td className="py-3 flex items-center gap-2">
                                <input
                                    type="number"
                                    className="bg-[#312c36] border border-gray-600 rounded px-3 py-1 w-24 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    value={inputs.dailyLogSize}
                                    onChange={e => handleChange(e, 'dailyLogSize')}
                                    min="0"
                                />
                                <span className="ml-2">GB</span>
                            </td>
                        </tr>
                        <tr className="border-b border-gray-700">
                            <td className="py-3 pr-4 font-semibold">Number of machines</td>
                            <td className="py-3">
                                <input
                                    type="number"
                                    className="bg-[#312c36] border border-gray-600 rounded px-3 py-1 w-24 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    value={inputs.numberOfMachines}
                                    onChange={e => handleChange(e, 'numberOfMachines')}
                                    min="1"
                                />
                            </td>
                        </tr>
                        <tr className="border-b border-gray-700">
                            <td className="py-3 pr-4 font-semibold">Hot data retention</td>
                            <td className="py-3 flex items-center gap-2">
                                <input
                                    type="number"
                                    className="bg-[#312c36] border border-gray-600 rounded px-3 py-1 w-24 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    value={inputs.hotDataRetention}
                                    onChange={e => handleChange(e, 'hotDataRetention')}
                                    min="1"
                                />
                                <span className="ml-2 font-bold">days</span>
                            </td>
                        </tr>
                        <tr className="border-b border-gray-700">
                            <td className="py-3 pr-4 font-semibold">Backup count for hot data</td>
                            <td className="py-3">
                                <input
                                    type="number"
                                    className="bg-[#312c36] border border-gray-600 rounded px-3 py-1 w-24 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    value={inputs.backupCount}
                                    onChange={e => handleChange(e, 'backupCount')}
                                    min="1"
                                />
                                <span className="ml-2">(original + {Number(inputs.backupCount) - 1} backups)</span>
                            </td>
                        </tr>
                        <tr className="border-b border-gray-700">
                            <td className="py-3 pr-4 font-semibold">Compression ratio</td>
                            <td className="py-3">
                                <input
                                    type="number"
                                    step="0.01"
                                    className="bg-[#312c36] border border-gray-600 rounded px-3 py-1 w-24 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    value={inputs.compressionRatio}
                                    onChange={e => handleChange(e, 'compressionRatio')}
                                    min="1"
                                />
                                <span className="ml-2">(1GB raw log = {inputs.compressionRatio}GB indexed)</span>
                            </td>
                        </tr>
                        <tr>
                            <td className="py-3 pr-4 font-semibold">Disk redundancy</td>
                            <td className="py-3 flex items-center gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    className="bg-[#312c36] border border-gray-600 rounded px-3 py-1 w-24 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    value={inputs.diskRedundancy}
                                    onChange={e => handleChange(e, 'diskRedundancy')}
                                    min="1"
                                />
                                <span className="ml-2">({diskUsagePercent}% disk usage)</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Results Section */}
            <div className="bg-[#232026] rounded-lg shadow-lg p-8 w-full max-w-2xl mt-8">
                <h3 className="text-xl font-bold mb-4">The total storage needed for hot data:</h3>
                <div className="mb-2 text-base">
                    <span className="font-mono">Daily log size × Backup count × Compression ratio × Disk redundancy × Hot data retention</span>
                </div>
                <div className="mb-2 text-base font-mono">
                    {`${inputs.dailyLogSize}GB × ${inputs.backupCount} × ${inputs.compressionRatio} × ${inputs.diskRedundancy} × ${inputs.hotDataRetention} = ${totalStorage ? totalStorage.toLocaleString(undefined, {maximumFractionDigits: 2}) : '0.00'}GB`}
                </div>
                <div className="mb-4 text-base font-mono">
                    {`${totalStorage ? totalStorage.toLocaleString(undefined, {maximumFractionDigits: 2}) : '0.00'}GB = ${(totalStorage/1000).toLocaleString(undefined, {maximumFractionDigits: 3})}TB`}
                </div>
            </div>

            <div className="bg-[#232026] rounded-lg shadow-lg p-8 w-full max-w-2xl mt-8">
                <h3 className="text-xl font-bold mb-4">Hot data storage needed for each machine:</h3>
                <div className="mb-2 text-base">
                    <span className="font-mono">Total storage needed for hot data ÷ Number of machines</span>
                </div>
                <div className="mb-2 text-base font-mono">
                    {`${totalStorage ? totalStorage.toLocaleString(undefined, {maximumFractionDigits: 2}) : '0.00'}GB ÷ ${inputs.numberOfMachines} = ${totalStoragePerMachine ? (totalStoragePerMachine / 1000).toLocaleString(undefined, {maximumFractionDigits: 3}) : '0.00'}TB`}
                </div>
            </div>

            <div className="bg-[#232026] rounded-lg shadow-lg p-8 w-full max-w-2xl mt-8">
                <h3 className="text-xl font-bold mb-4">The total storage needed for cold data:</h3>
                <div className="mb-2 text-base">
                    <span className="font-mono">Daily log size × Hot data retention</span>
                </div>
                <div className="mb-2 text-base font-mono">
                    {`${inputs.dailyLogSize}GB × ${inputs.hotDataRetention} = ${totalColdStorage.toLocaleString(undefined, {maximumFractionDigits: 2})}GB = ${totalColdStorageTB.toLocaleString(undefined, {maximumFractionDigits: 3})}TB`}
                </div>
            </div>

            <div className="bg-[#232026] rounded-lg shadow-lg p-8 w-full max-w-2xl mt-8">
                <h3 className="text-xl font-bold mb-4">Total Storage Needed:</h3>
                <div className="mb-2 text-base">
                    <span className="font-mono">Total storage needed for hot data + Total storage needed for cold data</span>
                </div>
                <div className="mb-2 text-base font-mono">
                    {`${totalStorage ? totalStorage.toLocaleString(undefined, {maximumFractionDigits: 2}) : '0.00'}GB + ${totalColdStorage ? totalColdStorage.toLocaleString(undefined, {maximumFractionDigits: 2}) : '0.00'}GB = ${totalStorage + totalColdStorage ? (totalStorage + totalColdStorage).toLocaleString(undefined, {maximumFractionDigits: 3}) : '0.00'}GB`}
                </div>
                <div className="mb-2 text-base font-mono">
                    {`${totalStorage + totalColdStorage ? (totalStorage + totalColdStorage).toLocaleString(undefined, {maximumFractionDigits: 3}) : '0.00'}GB = ${(totalStorage + totalColdStorage)/1000 ? ((totalStorage + totalColdStorage)/1000).toLocaleString(undefined, {maximumFractionDigits: 3}) : '0.00'}TB`}
                </div>
            </div>

            <div className="bg-[#232026] rounded-lg shadow-lg p-8 w-full max-w-2xl mt-8">
                <h3 className="text-xl font-bold mb-4">Resources Reference</h3>
                {currentResourceReference.map((reference, index) => (
                    <div key={`machine-requirement-${index}`} className='section-start-justify-center flex-col'>
                        <p className='text-base'>{reference.name}</p>
                        <img src={reference.url} alt="Resource Reference" />
                    </div>
                ))}
            </div>

        </div>
    );
}