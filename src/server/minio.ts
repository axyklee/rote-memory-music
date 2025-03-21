import { env } from '@/env'
import * as Minio from 'minio'

export const s3 = new Minio.Client({
    endPoint: env.MINIO_ENDPOINT,
    port: 443,
    useSSL: true,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY
})
