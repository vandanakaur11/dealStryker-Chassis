import { LexRuntimeV2 } from 'aws-sdk'
import axios from 'axios'
export const getBlob = async (fileUri) => {
  const resp = await fetch(fileUri)
  const imageBody = await resp.blob()
  return imageBody
}
export async function uploadToS3({ presignedPostUrl, fileType, fileContents }) {
  console.log('asdlkja', presignedPostUrl, fileContents, fileType)

  const response = await axios.put(presignedPostUrl, fileContents, {
    headers: {
      'Access-Control-Allow-Origin': 'https://chassis-staging.herokuapp.com/',
      // 'Access-Control-Allow-Credentials': false,
      'Access-Control-Allow-Headers':
        ' Origin, Content-Type, X-Auth-Token, x-amz-id-2,x-amz-request-id:',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Content-Type': fileType,
    },
    crossDomain: true,
  })

  return response
}

// const GET_PRESIGNED_URL_API_PATH = 'get-presigned-url-s3'

// async function getPresignedPostUrl(fileType) {
//   const { data: presignedPostUrl } = await axios.get(
//     `${API_BASE_URL}/${GET_PRESIGNED_URL_API_PATH}?fileType=${fileType}`,
//   )

//   return presignedPostUrl
// }
