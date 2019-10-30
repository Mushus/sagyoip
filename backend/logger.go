package main

import (
	"io"
	"os"
)

type fileLogWriter struct {
	file *os.File
}

func newFileLogWriter(file *os.File) io.Writer {
	return fileLogWriter{
		file: file,
	}
}

func (f fileLogWriter) Write(data []byte) (n int, err error) {
	n, err = f.file.Write(data)
	if err != nil {
		return
	}

	err = f.file.Sync()
	return
}
