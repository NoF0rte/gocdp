# gocdp
Golang Content Discovery Parser. Parses and normalizes content discovery output
 # CLI
 To install the CLI run the following
 ```
 go install github.com/NoF0rte/gocdp/cmd/gocdp@latest
 ```

 ## Examples
 ### Example 1
```
gocdp ffuf* -q '.IsSuccess' -f '{{.Url}}'
```
Or
```
find ./ -name '*ffuf*' | gocdp - -q '.IsSuccess' -f '{{.Url}}'
```
Show only the URLs from the results with success status codes
### Example 2
```
gocdp ffuf* -q '.IsRedirect' -f '{{.Redirect}}'
```
Show the redirect URLs from the results which were redirected
### Example 3
```
gocdp ffuf* -q '.IsRedirect' -f '{{.Url}} -> {{.Redirect}}'
```
Show the urls and where they redirect from the results which were redirected
### Example 4
```
gocdp ffuf* -q 'not (or .IsRateLimit .IsError)'
```
Show the JSON output of all results which weren't rate limited or errors
### Example 5
```
gocdp ffuf* -q 'not (.IsStatus "400,429,401")'
```
Show the JSON output of all results except the ones with status codes 400, 429, or 401
### Example 6
```
gocdp ffuf* -q '.IsStatus "409"'
```
Show the JSON output of only the results with the status code of 409
### Example 7
```
gocdp ffuf* -g range
```
Show the JSON output of all results, grouped by the status code ranges i.e. 200-299, 300-399, etc.
### Example 8
```
gocdp ffuf* -g status
```
Show the JSON output of all results, grouped by the status code

 # Library
 To use `gocdp` as a library run the following
 ```
 go get github.com/NoF0rte/gocdp
 ```
 
 ## Examples
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
