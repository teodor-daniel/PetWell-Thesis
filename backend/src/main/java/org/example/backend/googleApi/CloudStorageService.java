package org.example.backend.googleApi;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.Storage.BlobListOption;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class CloudStorageService {

    private final Storage storage;

    public CloudStorageService(Storage storage) {
        this.storage = storage;
    }


    public boolean blobExists(String bucket, String object) {
        return storage.get(bucket, object) != null;
    }

    public String generateSignedUrl(String bucket, String object, int minutes) {

        URL url = storage.signUrl(BlobInfo.newBuilder(bucket, object).build(), minutes, TimeUnit.MINUTES, Storage.SignUrlOption.withV4Signature());

        return url.toString();
    }


    public void uploadObjectFromMemory(String bucket, String object, byte[] content) {

        storage.create(BlobInfo.newBuilder(bucket, object).build(), content, Storage.BlobTargetOption.doesNotExist());
    }

    public void createFolderIfMissing(String bucket, String folderPath) {
        if (!folderPath.endsWith("/")) folderPath += "/";

        if (!blobExists(bucket, folderPath)) {
            storage.create(BlobInfo.newBuilder(bucket, folderPath).setContentType("application/x-directory").build());
        }
    }

    public void deleteObject(String bucket, String object) {
        storage.delete(bucket, object);
    }

    public void copyObject(String sourceBucket, String sourceObject, String targetBucket, String targetObject) {

        storage.copy(Storage.CopyRequest.newBuilder().setSource(BlobId.of(sourceBucket, sourceObject)).setTarget(BlobId.of(targetBucket, targetObject)).build());
    }

    public void renameObject(String bucket, String oldObjectName, String newObjectName) {
        if (blobExists(bucket, oldObjectName)) {
            copyObject(bucket, oldObjectName, bucket, newObjectName);
            deleteObject(bucket, oldObjectName);
        }
    }

    public void deleteFolderAndContents(String bucket, String folderPrefix) {
        if (!folderPrefix.endsWith("/")) folderPrefix += "/";
        Iterable<Blob> blobs = storage.list(bucket, BlobListOption.prefix(folderPrefix)).iterateAll();
        List<BlobId> toDelete = new ArrayList<>();
        for (Blob blob : blobs) {
            toDelete.add(blob.getBlobId());
        }
        if (!toDelete.isEmpty()) {
            storage.delete(toDelete);
        }
    }

}
