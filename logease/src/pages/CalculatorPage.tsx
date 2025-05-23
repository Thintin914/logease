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

    const [currentResourceReference, setCurrentResourceReference] = useState<{ url: string; name: string }[]>(findClosestResourceReference(inputs.dailyLogSize));
    useEffect(() => {
        setCurrentResourceReference(findClosestResourceReference(String(parseFloat(inputs.dailyLogSize) * parseFloat(inputs.hotDataRetention))));
    }, [inputs.dailyLogSize, inputs.hotDataRetention]);

    function findClosestResourceReference(dailyLogSize: string): { url: string; name: string }[] {
        const size = parseFloat(dailyLogSize);
        const references: { url: string; name: string }[] = [];
        
        // Always include single machine case for small sizes
        if (size <= 20) {
            references.push(
                { url: resourceReference[0]["10g-20g-single"], name: "10g-20g-single" },
                { url: resourceReference[0]["10g-20g-cluster"], name: "10g-20g-cluster" }
            );
        }
        
        // Add all cluster configurations that can handle the size
        if (size <= 100) {
            references.push({ url: resourceReference[0]["100g-cluster"], name: "100g-cluster" });
        }
        if (size <= 300) {
            references.push({ url: resourceReference[0]["300g-cluster"], name: "300g-cluster" });
        }
        if (size <= 1000) {
            references.push({ url: resourceReference[0]["1t-cluster"], name: "1t-cluster" });
        }
        if (size <= 10000) {
            references.push({ url: resourceReference[0]["10t-cluster"], name: "10t-cluster" });
        }
        
        // Always include the largest configuration as a fallback
        references.push({ url: resourceReference[0]["10t-cluster"], name: "10t-cluster" });
        
        if (references.length > 0) {
            references[0].name += " (Closest)";
        }

        return references;
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

            <div className="bg-[#232026] rounded-lg shadow-lg p-8 w-full max-w-2xl mt-8">
                <h3 className="text-xl font-bold mb-4">Resources Reference</h3>
                {currentResourceReference.map((reference, index) => (
                    <div key={`machine-requirement-${index}`} className='section-start-justify-center flex-col'>
                        <p className='text-base'>{reference.name}</p>
                        <img src={reference.url} alt="Resource Reference" />
                    </div>
                ))}
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
                <h3 className="text-xl font-bold mb-4">Cold data storage needed for each machine:</h3>
                <div className="mb-2 text-base font-mono">
                    {`${totalColdStorageTB.toLocaleString(undefined, {maximumFractionDigits: 3})}TB ÷ ${inputs.numberOfMachines} = ${coldStoragePerMachineTB.toLocaleString(undefined, {maximumFractionDigits: 3})}TB`}
                </div>
            </div>

        </div>
    );
}