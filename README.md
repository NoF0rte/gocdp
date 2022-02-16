# gocdp
Golang Content Discovery Parser. Parses and normalizes content discovery output
 ## CLI
 To install the CLI run the following
 ```
 go install github.com/NoF0rte/gocdp/gocdp@latest
 ```
 ## Library
 To use `gocdp` as a library run the following
 ```
 go get github.com/NoF0rte/gocdp
 ```
 
 ### Examples
 ```go
 package main
 
 import github.com/NoF0rte/gocdp
 
 func main() {
  results, err := gocdp.SmartParseFile("ffuf.json")
  if err != nil {
    panic(err)
  }
  
  fmt.Println(results)
 }
 ```
