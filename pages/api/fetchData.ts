import type { NextApiRequest, NextApiResponse } from 'next';
import fetchDataFromSheet from './../../src/utils/fetchDataFromSheet';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const data = await fetchDataFromSheet();
        console.log(data);
        res.status(200).json(data);
    } catch (err: any) {
        res.status(500).json({ statusCode: 500, message: err.message });
    }
}
