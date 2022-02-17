# gocdp
Golang Content Discovery Parser. Parses and normalizes content discovery output
 ## CLI
 To install the CLI run the following
 ```
 go install github.com/NoF0rte/gocdp/gocdp@latest
 ```

 ### Examples
```
gocdp ffuf* -q '.IsSuccess' -f '{{.Url}}'

OR

find ./ -name '*ffuf*' | gocdp - -q '.IsSuccess' -f '{{.Url}}'
```
Show only the URLs from the results with success status codes

```
gocdp ffuf* -q '.IsRedirect' -f '{{.Redirect}}'
```
Show the redirect URLs from the results which were redirected

```
gocdp ffuf* -q 'not (or .IsRateLimit .IsError)'
```
Show the JSON output of all results which weren't rate limited or errors

```
gocdp ffuf* -g
```
Show the JSON output of all results, grouped by the status code ranges i.e. 200-299, 300-399, etc.

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
